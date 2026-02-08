import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Song, LyricLine } from '@/types/song';
import { saveAudioToIndexedDB } from './audioStorage';

export async function exportProjectAsChnt(song: Song): Promise<void> {
    const zip = new JSZip();

    // Create project.json (without the large base64 audio data string if we were using that, 
    // but we are using audioData as blobUrl or empty in state).
    // We want to export the metadata.
    const projectData = { ...song, audioData: '' };
    zip.file('project.json', JSON.stringify(projectData, null, 2));

    // Add audio file if present
    if (song.audioData) {
        try {
            const response = await fetch(song.audioData);
            const audioBlob = await response.blob();
            // Use original filename or default
            const fileName = song.audioFileName || 'audio.mp3';
            zip.file(fileName, audioBlob);
        } catch (error) {
            console.error('Failed to fetch audio for export:', error);
        }
    }

    // Generate zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const filename = `${song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'untitled'}.chnt`;
    saveAs(content, filename);
}

export async function importProjectFromChnt(file: File): Promise<Song> {
    const zip = await JSZip.loadAsync(file);

    // Read project.json
    const projectFile = zip.file('project.json');
    if (!projectFile) {
        throw new Error('Invalid .CHNT file: project.json missing');
    }

    const projectJson = await projectFile.async('string');
    const songData: Song = JSON.parse(projectJson);

    // Find audio file
    let audioFile: JSZip.JSZipObject | null = null;
    const audioFileName = songData.audioFileName;

    if (audioFileName) {
        audioFile = zip.file(audioFileName);
    }

    // Fallback: search for common audio extensions if specific file not found
    if (!audioFile) {
        const files = Object.keys(zip.files);
        const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.flac'];
        const found = files.find(name => audioExts.some(ext => name.toLowerCase().endsWith(ext)));
        if (found) {
            audioFile = zip.file(found);
            songData.audioFileName = found; // Update filename
        }
    }

    let audioBlobUrl = '';
    if (audioFile) {
        const audioBlob = await audioFile.async('blob');
        // Regenerate ID to treat as new project import
        songData.id = Date.now().toString(36) + Math.random().toString(36).substr(2);

        const audioFileObj = new File([audioBlob], songData.audioFileName || 'audio.mp3', { type: audioBlob.type });
        audioBlobUrl = await saveAudioToIndexedDB(songData.id, audioFileObj);
    } else {
        // If no audio, still regenerate ID
        songData.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    return {
        ...songData,
        audioData: audioBlobUrl,
    };
}

export function exportLyricsAsTxt(song: Song): void {
    const lines = song.lyrics.map(line => {
        // If it's a structural prompt (no timestamp, usually brackets like [Chorus])
        if (!line.timestamp) {
            return `\n${line.text}\n`;
        }
        // Regular lyrics
        return line.text;
    });

    const content = `Title: ${song.title}\n\n${lines.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const filename = `${song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'untitled'}_lyrics.txt`;
    saveAs(blob, filename);
}
