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

  // Refs to access current state inside stable callbacks without dependencies
  const historyRef = useRef(history);
  const currentIndexRef = useRef(currentIndex);

  // Keep refs in sync with state
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Push a new state to history (debounced to group rapid changes)
  const pushState = useCallback((lyrics: LyricLine[], forceNew = false) => {
    const now = Date.now();
    const timeSinceLastPush = now - lastPushTime.current;
    
    // Use refs to get current values
    const currentHistory = historyRef.current;
    const idx = currentIndexRef.current;

    // Check if within debounce window and not forced
    if (!forceNew && timeSinceLastPush < DEBOUNCE_MS && currentHistory.length > 0) {
      setHistory(prev => {
        const updated = [...prev];
        // We use functional update to be safe, but logic relies on ref values for decisions
        // that don't need to re-run the callback itself.
        // Wait, if we use setHistory(prev => ...), we don't need historyRef for the *update* logic
        // but we might need it for *deciding* whether to update or splice.
        // Actually, let's just use the ref values for the logic calculation to keep it simple and consistent.
        
        // Re-calculating based on ref values:
        const newHistoryWithUpdate = [...currentHistory];
        newHistoryWithUpdate[idx] = { lyrics, timestamp: now };
        return newHistoryWithUpdate;
      });
      return; 
    }

    // Otherwise, create a new entry
    // Remove any future history if we've undone and are now making changes
    const truncatedHistory = currentHistory.slice(0, idx + 1);
    
    // Add new entry
    truncatedHistory.push({ lyrics, timestamp: now });
    
    // Limit history size
    if (truncatedHistory.length > MAX_HISTORY_SIZE) {
      truncatedHistory.shift();
    }
    
    setHistory(truncatedHistory);
    
    // Update index to point to the new latest entry
    // If we shifted, the index stays at length-1 (which is consistent)
    // If we didn't shift, it increments.
    // Actually, if we shifted, the length stays at MAX_HISTORY_SIZE.
    // The new index should be newHistory.length - 1.
    setCurrentIndex(truncatedHistory.length - 1);
    
    lastPushTime.current = now;
  }, []); // Stable callback!

  // Undo: go back one step
  const undo = useCallback((): LyricLine[] | null => {
    const idx = currentIndexRef.current;
    const hist = historyRef.current;
    
    if (idx <= 0) return null;
    
    const newIndex = idx - 1;
    setCurrentIndex(newIndex);
    return hist[newIndex]?.lyrics || null;
  }, []); // Stable callback!

  // Redo: go forward one step
  const redo = useCallback((): LyricLine[] | null => {
    const idx = currentIndexRef.current;
    const hist = historyRef.current;
    
    if (idx >= hist.length - 1) return null;
    
    const newIndex = idx + 1;
    setCurrentIndex(newIndex);
    return hist[newIndex]?.lyrics || null;
  }, []); // Stable callback!

  // Reset history with new initial state
  const resetHistory = useCallback((lyrics: LyricLine[]) => {
    const newHistory = [{ lyrics, timestamp: Date.now() }];
    setHistory(newHistory);
    setCurrentIndex(0);
    lastPushTime.current = 0;
    
    // Update refs immediately to prevent race conditions if called in rapid succession
    historyRef.current = newHistory;
    currentIndexRef.current = 0;
  }, []); // Stable callback!

  // Check if we can undo/redo (derived from state for rendering)
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

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
