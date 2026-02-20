import { useState, useEffect, useCallback, useRef } from 'react';
import type { Song, LyricLine } from '@/types/song';
import { countSyllables } from '@/lib/syllables';
import {
  saveAudioToIndexedDB,
  loadAudioFromIndexedDB,
  deleteAudioFromIndexedDB,
} from '@/lib/audioStorage';

const STORAGE_KEY = 'songwriting-notebook-songs';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Store songs without audioData to avoid localStorage size limits
interface StoredSong extends Omit<Song, 'audioData'> {
  hasAudio: boolean;
}

function loadSongsFromStorage(): Song[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const storedSongs: StoredSong[] = JSON.parse(stored);
    return storedSongs.map(s => ({
      ...s,
      audioData: '',
    }));
  } catch {
    return [];
  }
}

function saveSongsToStorage(songs: Song[]): void {
  try {
    const songsToStore: StoredSong[] = songs.map(s => ({
      id: s.id,
      title: s.title,
      audioFileName: s.audioFileName,
      lyrics: s.lyrics,
      notes: s.notes,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      hasAudio: !!s.audioFileName,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songsToStore));
  } catch (error) {
    console.error('Error saving songs to localStorage:', error);
  }
}

// Session audio cache (for blob URLs)
const audioCache = new Map<string, string>();

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load songs and audio on mount
  useEffect(() => {
    async function loadData() {
      const loadedSongs = loadSongsFromStorage();
      setSongs(loadedSongs);
      setIsLoaded(true);
    }

    loadData();
  }, []);

  // Keep track of the latest songs for cleanup/unmount
  const songsRef = useRef(songs);
  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  // Save when songs change (debounced)
  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      saveSongsToStorage(songs);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [songs, isLoaded]);

  // Save on unmount or refresh to catch pending changes
  useEffect(() => {
    const handleUnload = () => {
      if (isLoaded) {
        saveSongsToStorage(songsRef.current);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (isLoaded) {
        saveSongsToStorage(songsRef.current);
      }
    };
  }, [isLoaded]);

  const createSong = useCallback(async (title: string, audioFile: File | null): Promise<Song> => {
    const songId = generateId();
    let audioBlobUrl = '';
    let audioFileName = '';

    if (audioFile) {
      audioFileName = audioFile.name;
      // Save to IndexedDB (auto-converts to Opus) and get blob URL
      const result = await saveAudioToIndexedDB(songId, audioFile);
      audioBlobUrl = result.blobUrl;
      audioFileName = result.fileName;
      audioCache.set(songId, audioBlobUrl);
    }

    const newSong: Song = {
      id: songId,
      title,
      audioFileName,
      audioData: audioBlobUrl,
      lyrics: [createEmptyLine()],
      notes: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSongs(prev => [...prev, newSong]);
    return newSong;
  }, []);

  const updateSong = useCallback(async (songId: string, updates: Partial<Song>, audioFile?: File): Promise<void> => {
    // If updating audio with a new file, save to IndexedDB
    if (audioFile) {
      const result = await saveAudioToIndexedDB(songId, audioFile);
      audioCache.set(songId, result.blobUrl);
      updates.audioData = result.blobUrl;
      updates.audioFileName = result.fileName;
    }

    setSongs(prev => prev.map(song =>
      song.id === songId
        ? { ...song, ...updates, updatedAt: Date.now() }
        : song
    ));
  }, []);

  const deleteSong = useCallback(async (songId: string): Promise<void> => {
    // Clean up cached audio blob URL
    const cachedUrl = audioCache.get(songId);
    if (cachedUrl) {
      URL.revokeObjectURL(cachedUrl);
      audioCache.delete(songId);
    }

    // Delete from IndexedDB
    await deleteAudioFromIndexedDB(songId);

    setSongs(prev => prev.filter(song => song.id !== songId));
  }, []);

  const getSong = useCallback((songId: string): Song | undefined => {
    const song = songs.find(song => song.id === songId);
    if (song) {
      const cachedAudio = audioCache.get(songId);
      if (cachedAudio && !song.audioData) {
        return { ...song, audioData: cachedAudio };
      }
    }
    return song;
  }, [songs]);

  const loadSongAudio = useCallback(async (songId: string) => {
    // Check if already in cache
    if (audioCache.has(songId)) {
      const blobUrl = audioCache.get(songId)!;
      setSongs(prev => prev.map(song =>
        song.id === songId
          ? { ...song, audioData: blobUrl }
          : song
      ));
      return;
    }

    const entry = await loadAudioFromIndexedDB(songId);
    if (entry) {
      audioCache.set(songId, entry.blobUrl);
      setSongs(prev => prev.map(song =>
        song.id === songId
          ? { ...song, audioData: entry.blobUrl, audioFileName: entry.fileName || song.audioFileName }
          : song
      ));
    }
  }, []);

  const importSong = useCallback(async (songData: Song): Promise<void> => {
    // Ensure ID is unique or regenerated during import process (already done in projectFile.ts usually)
    // But let's just push it to state.

    // Check if audio exists in the song object (as blobUrl) and cache it
    if (songData.audioData) {
      audioCache.set(songData.id, songData.audioData);
    }

    setSongs(prev => [songData, ...prev]);
  }, []);

  return {
    songs,
    isLoaded,
    createSong,
    updateSong,
    deleteSong,
    importSong,
    getSong,
    loadSongAudio,
  };
}

export function createEmptyLine(): LyricLine {
  return {
    id: generateId(),
    timestamp: '',
    text: '',
    syllableCount: 0,
  };
}

export function updateLineText(line: LyricLine, text: string): LyricLine {
  return {
    ...line,
    text,
    syllableCount: countSyllables(text),
  };
}
