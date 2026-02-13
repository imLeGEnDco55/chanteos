// Native audio-to-Opus converter using Web Audio API + MediaRecorder
// Zero external dependencies - uses browser-native encoding
import { toast } from 'sonner';

const OPUS_MIME = 'audio/webm;codecs=opus';

// Formats already compressed — conversion gives negligible benefit
const COMPRESSED_FORMATS = [
    'audio/mpeg',       // MP3
    'audio/mp3',
    'audio/aac',        // AAC
    'audio/mp4',        // M4A / AAC
    'audio/x-m4a',
    'audio/ogg',        // OGG Vorbis
    'audio/flac',       // FLAC (lossless but small enough)
    'audio/x-flac',
];

/**
 * Check if a file is already in a compressed format (skip conversion)
 */
function isAlreadyCompressed(file: File): boolean {
    const mime = file.type.toLowerCase();
    if (mime.includes('webm') || mime.includes('opus')) return true;
    if (COMPRESSED_FORMATS.some(fmt => mime.includes(fmt.split('/')[1]))) return true;

    // Also check extension as fallback (some browsers return empty MIME)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const compressedExts = ['mp3', 'aac', 'm4a', 'ogg', 'opus', 'webm', 'flac', 'wma'];
    return compressedExts.includes(ext);
}

/**
 * Convert uncompressed audio (WAV, AIFF) to Opus/WebM for storage optimization.
 * Already-compressed formats (MP3, AAC, OGG, etc.) are kept as-is.
 */
export async function convertToOpus(file: File): Promise<File> {
    // Skip compressed formats
    if (isAlreadyCompressed(file)) {
        const msg = `${file.name} ya está comprimido (${formatSize(file.size)})`;
        console.log(`[AudioConverter] ${msg}`);
        toast.info(msg, { duration: 3000 });
        return file;
    }

    // Check MediaRecorder Opus support
    if (!MediaRecorder.isTypeSupported(OPUS_MIME)) {
        toast.warning('Tu navegador no soporta Opus — audio guardado sin convertir');
        return file;
    }

    const originalSize = file.size;
    console.log(`[AudioConverter] Converting: ${file.name} (${formatSize(originalSize)})`);

    // Show persistent toast with progress
    const toastId = toast.loading(
        `Convirtiendo ${file.name} a Opus... esto toma unos segundos`,
        { duration: Infinity }
    );

    try {
        const converted = await transcode(file, (progress) => {
            const pct = Math.round(progress * 100);
            toast.loading(
                `Convirtiendo audio... ${pct}%`,
                { id: toastId, duration: Infinity }
            );
        });

        const newName = file.name.replace(/\.[^/.]+$/, '.webm');
        const result = new File([converted], newName, { type: OPUS_MIME });
        const reduction = Math.round((1 - result.size / originalSize) * 100);

        const doneMsg = `Audio convertido: ${formatSize(originalSize)} → ${formatSize(result.size)} (${reduction}% menor)`;
        console.log(`[AudioConverter] ${doneMsg}`);
        toast.success(doneMsg, { id: toastId, duration: 5000 });

        return result;
    } catch (error) {
        console.error('[AudioConverter] Conversion failed:', error);
        toast.error('Conversión falló — audio guardado original', { id: toastId, duration: 4000 });
        return file;
    }
}

/**
 * Core transcode: decode audio → re-encode as Opus via MediaRecorder
 * onProgress callback receives 0..1
 */
async function transcode(file: File, onProgress?: (pct: number) => void): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext();

    // Ensure AudioContext is running (may be suspended without gesture)
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    try {
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const totalDuration = audioBuffer.duration;

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);

        const recorder = new MediaRecorder(dest.stream, {
            mimeType: OPUS_MIME,
            audioBitsPerSecond: 128000,
        });

        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        // Progress tracking
        let progressInterval: ReturnType<typeof setInterval> | null = null;
        if (onProgress) {
            const startTime = audioCtx.currentTime;
            progressInterval = setInterval(() => {
                const elapsed = audioCtx.currentTime - startTime;
                onProgress(Math.min(elapsed / totalDuration, 0.99));
            }, 500);
        }

        const recordingDone = new Promise<Blob>((resolve, reject) => {
            recorder.onstop = () => {
                if (progressInterval) clearInterval(progressInterval);
                onProgress?.(1);
                resolve(new Blob(chunks, { type: OPUS_MIME }));
            };
            recorder.onerror = (e) => {
                if (progressInterval) clearInterval(progressInterval);
                reject(e);
            };
        });

        recorder.start(100); // Collect data every 100ms
        source.start(0);

        source.onended = () => {
            setTimeout(() => {
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            }, 150);
        };

        // Safety timeout: audio duration + 10s buffer
        const timeoutMs = (totalDuration + 10) * 1000;
        const result = await Promise.race([
            recordingDone,
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Conversion timeout')), timeoutMs)
            ),
        ]);

        return result;
    } finally {
        await audioCtx.close();
    }
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
