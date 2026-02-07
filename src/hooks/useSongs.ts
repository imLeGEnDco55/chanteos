import { useState, useEffect, useCallback } from 'react';
import type { Song, LyricLine } from '@/types/song';
import { countSyllables } from '@/lib/syllables';

const STORAGE_KEY = 'songwriting-notebook-songs';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadSongsFromStorage(): Song[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSongsToStorage(songs: Song[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  } catch (error) {
    console.error('Error saving songs to localStorage:', error);
  }
}

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar canciones al montar
  useEffect(() => {
    setSongs(loadSongsFromStorage());
    setIsLoaded(true);
  }, []);

  // Guardar cuando cambian las canciones
  useEffect(() => {
    if (isLoaded) {
      saveSongsToStorage(songs);
    }
  }, [songs, isLoaded]);

  const createSong = useCallback((title: string, audioFileName: string, audioData: string): Song => {
    const newSong: Song = {
      id: generateId(),
      title,
      audioFileName,
      audioData,
      lyrics: [createEmptyLine()],
      notes: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setSongs(prev => [...prev, newSong]);
    return newSong;
  }, []);

  const updateSong = useCallback((songId: string, updates: Partial<Song>): void => {
    setSongs(prev => prev.map(song => 
      song.id === songId 
        ? { ...song, ...updates, updatedAt: Date.now() }
        : song
    ));
  }, []);

  const deleteSong = useCallback((songId: string): void => {
    setSongs(prev => prev.filter(song => song.id !== songId));
  }, []);

  const getSong = useCallback((songId: string): Song | undefined => {
    return songs.find(song => song.id === songId);
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
