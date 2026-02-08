import { useState, useCallback, useRef } from 'react';
import type { LyricLine, LyricsHistoryEntry } from '@/types/song';

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_MS = 500; // Group changes within this window

export function useLyricsHistory(initialLyrics: LyricLine[]) {
  const [history, setHistory] = useState<LyricsHistoryEntry[]>([
    { lyrics: initialLyrics, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastPushTime = useRef<number>(0);

  // Push a new state to history (debounced to group rapid changes)
  const pushState = useCallback((lyrics: LyricLine[], forceNew = false) => {
    const now = Date.now();
    const timeSinceLastPush = now - lastPushTime.current;

    setHistory(prev => {
      // If within debounce window and not forced, update the current entry
      if (!forceNew && timeSinceLastPush < DEBOUNCE_MS && prev.length > 0) {
        const updated = [...prev];
        updated[currentIndex] = { lyrics, timestamp: now };
        return updated;
      }

      // Otherwise, create a new entry
      // Remove any future history if we've undone and are now making changes
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add new entry
      newHistory.push({ lyrics, timestamp: now });
      
      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });

    // Update index only if we're creating a new entry
    if (forceNew || timeSinceLastPush >= DEBOUNCE_MS) {
      setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
    }
    
    lastPushTime.current = now;
  }, [currentIndex]);

  // Undo: go back one step
  const undo = useCallback((): LyricLine[] | null => {
    if (currentIndex <= 0) return null;
    
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return history[newIndex]?.lyrics || null;
  }, [currentIndex, history]);

  // Redo: go forward one step
  const redo = useCallback((): LyricLine[] | null => {
    if (currentIndex >= history.length - 1) return null;
    
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return history[newIndex]?.lyrics || null;
  }, [currentIndex, history]);

  // Check if we can undo/redo
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Reset history with new initial state
  const resetHistory = useCallback((lyrics: LyricLine[]) => {
    setHistory([{ lyrics, timestamp: Date.now() }]);
    setCurrentIndex(0);
    lastPushTime.current = 0;
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    historyLength: history.length,
    currentIndex,
  };
}
