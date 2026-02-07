import { useState, useEffect, useCallback } from 'react';
import type { Song, LyricLine } from '@/types/song';
import { countSyllables } from '@/lib/syllables';

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
    // Convert stored songs back to Song format (audioData will be empty)
    return storedSongs.map(s => ({
      ...s,
      audioData: '', // Audio needs to be re-loaded each session
    }));
  } catch {
    return [];
  }
}

function saveSongsToStorage(songs: Song[]): void {
  try {
    // Remove audioData before saving to avoid localStorage limits
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

// Session-only audio storage (not persisted)
const audioCache = new Map<string, string>();

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load songs on mount
  useEffect(() => {
    setSongs(loadSongsFromStorage());
    setIsLoaded(true);
  }, []);

  // Save when songs change (excluding audioData)
  useEffect(() => {
    if (isLoaded) {
      saveSongsToStorage(songs);
    }
  }, [songs, isLoaded]);

  const createSong = useCallback((title: string, audioFileName: string, audioBlobUrl: string): Song => {
    const newSong: Song = {
      id: generateId(),
      title,
      audioFileName,
      audioData: audioBlobUrl, // This is a blob URL, not base64
      lyrics: [createEmptyLine()],
      notes: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Cache the blob URL for this session
    if (audioBlobUrl) {
      audioCache.set(newSong.id, audioBlobUrl);
    }
    
    setSongs(prev => [...prev, newSong]);
    return newSong;
  }, []);

  const updateSong = useCallback((songId: string, updates: Partial<Song>): void => {
    // If updating audio, cache the new blob URL
    if (updates.audioData) {
      audioCache.set(songId, updates.audioData);
    }
    
    setSongs(prev => prev.map(song => 
      song.id === songId 
        ? { ...song, ...updates, updatedAt: Date.now() }
        : song
    ));
  }, []);

  const deleteSong = useCallback((songId: string): void => {
    // Clean up cached audio blob URL
    const cachedUrl = audioCache.get(songId);
    if (cachedUrl) {
      URL.revokeObjectURL(cachedUrl);
      audioCache.delete(songId);
    }
    
    setSongs(prev => prev.filter(song => song.id !== songId));
  }, []);

  const getSong = useCallback((songId: string): Song | undefined => {
    const song = songs.find(song => song.id === songId);
    if (song) {
      // Return song with cached audio if available
      const cachedAudio = audioCache.get(songId);
      if (cachedAudio && !song.audioData) {
        return { ...song, audioData: cachedAudio };
      }
    }
    return song;
  }, [songs]);

  return {
    songs,
    isLoaded,
    createSong,
    updateSong,
    deleteSong,
    getSong,
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
