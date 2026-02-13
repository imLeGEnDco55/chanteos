// Native audio-to-Opus converter using Web Audio API + MediaRecorder
// Zero external dependencies - uses browser-native encoding

const OPUS_MIME = 'audio/webm;codecs=opus';

/**
 * Check if a file is already in Opus/WebM format (skip conversion)
 */
export function isAlreadyOpus(file: File): boolean {
    const mime = file.type.toLowerCase();
    return mime.includes('webm') || mime.includes('opus');
}

/**
 * Convert any audio file to Opus/WebM format for storage optimization.
 * WAV (40MB) → Opus (~4MB) = ~10x reduction.
 * If already Opus, returns the original file unchanged.
 */
export async function convertToOpus(file: File): Promise<File> {
    // Skip if already Opus
    if (isAlreadyOpus(file)) {
        console.log(`[AudioConverter] Already Opus: ${file.name} (${formatSize(file.size)})`);
        return file;
    }

    // Check MediaRecorder Opus support
    if (!MediaRecorder.isTypeSupported(OPUS_MIME)) {
        console.warn('[AudioConverter] Opus not supported by browser, storing raw');
        return file;
    }

    console.log(`[AudioConverter] Converting: ${file.name} (${formatSize(file.size)})`);

    try {
        const originalSize = file.size;
        const converted = await transcode(file);
        const newName = file.name.replace(/\.[^/.]+$/, '.webm');
        const result = new File([converted], newName, { type: OPUS_MIME });

        console.log(
            `[AudioConverter] Done: ${formatSize(originalSize)} → ${formatSize(result.size)} ` +
            `(${Math.round((1 - result.size / originalSize) * 100)}% smaller)`
        );

        return result;
    } catch (error) {
        console.error('[AudioConverter] Conversion failed, storing original:', error);
        return file;
    }
}

/**
 * Core transcode: decode audio → re-encode as Opus via MediaRecorder
 */
async function transcode(file: File): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext();

    try {
        // Decode the source audio into raw PCM
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        // Create an offline rendering pipeline
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        // Route through MediaStreamDestination for MediaRecorder capture
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);

        // Set up MediaRecorder with Opus codec
        const recorder = new MediaRecorder(dest.stream, {
            mimeType: OPUS_MIME,
            audioBitsPerSecond: 128000, // 128kbps — good quality for music
        });

        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        // Start recording and playback simultaneously
        const recordingDone = new Promise<Blob>((resolve, reject) => {
            recorder.onstop = () => {
                resolve(new Blob(chunks, { type: OPUS_MIME }));
            };
            recorder.onerror = (e) => reject(e);
        });

        recorder.start();
        source.start(0);

        // Stop recording when source finishes playing
        source.onended = () => {
            // Small buffer to capture any trailing audio
            setTimeout(() => {
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            }, 100);
        };

        // Safety timeout: 2x the audio duration + 5s
        const timeoutMs = (audioBuffer.duration * 2 + 5) * 1000;
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
