import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { LyricLine, LyricsHistoryEntry } from '@/types/song';

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_MS = 500;

interface HistoryState {
  history: LyricsHistoryEntry[];
  currentIndex: number;
  lastPushTime: number;
}

type HistoryAction =
  | { type: 'PUSH'; lyrics: LyricLine[]; forceNew: boolean; timestamp: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; lyrics: LyricLine[]; timestamp: number };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'PUSH': {
      const { lyrics, forceNew, timestamp } = action;
      const { history, currentIndex, lastPushTime } = state;
      const timeSinceLastPush = timestamp - lastPushTime;

      // Check if we should update the current entry (debounce)
      if (!forceNew && timeSinceLastPush < DEBOUNCE_MS && history.length > 0) {
        const newHistory = [...history];
        newHistory[currentIndex] = { lyrics, timestamp };
        return {
          ...state,
          history: newHistory,
          lastPushTime: timestamp, // Update last push time even on replace? Yes, to keep extending the window? Or no?
          // Original logic: "lastPushTime.current = now;" happen unconditionally at end of pushState.
          // So yes.
        };
      }

      // Otherwise, create new entry
      const truncatedHistory = history.slice(0, currentIndex + 1);
      truncatedHistory.push({ lyrics, timestamp });

      if (truncatedHistory.length > MAX_HISTORY_SIZE) {
        truncatedHistory.shift();
      }

      return {
        history: truncatedHistory,
        currentIndex: truncatedHistory.length - 1,
        lastPushTime: timestamp,
      };
    }
    case 'UNDO': {
      if (state.currentIndex <= 0) return state;
      return {
        ...state,
        currentIndex: state.currentIndex - 1,
      };
    }
    case 'REDO': {
      if (state.currentIndex >= state.history.length - 1) return state;
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      };
    }
    case 'RESET': {
      return {
        history: [{ lyrics: action.lyrics, timestamp: action.timestamp }],
        currentIndex: 0,
        lastPushTime: 0,
      };
    }
    default:
      return state;
  }
}

export function useLyricsHistory(initialLyrics: LyricLine[]) {
  const [state, dispatch] = useReducer(historyReducer, {
    history: [{ lyrics: initialLyrics, timestamp: Date.now() }],
    currentIndex: 0,
    lastPushTime: 0,
  });

  const pushState = useCallback((lyrics: LyricLine[], forceNew = false) => {
    dispatch({ type: 'PUSH', lyrics, forceNew, timestamp: Date.now() });
  }, []);

  const undo = useCallback((): LyricLine[] | null => {
    // We need to return the new state's lyrics.
    // Since reducer is async in terms of state update reflection in 'state' variable during this render,
    // we can't return the *state after undo* immediately from here if we rely on 'state'.
    // BUT the original hook returned the lyrics *after* setting state?
    // Original: 
    // const newIndex = idx - 1;
    // setCurrentIndex(newIndex);
    // return hist[newIndex]?.lyrics || null;

    // With useReducer, we dispatch. We can't return the value synchronously from the dispatch.
    // This is a breaking change if the consumer relies on the return value of undo().
    // Let's check SongEditor.

    // SongEditor:
    // const handleUndo = useCallback(() => {
    //   const previousState = undo();
    //   if (previousState) {
    //     onUpdate({ lyrics: previousState });
    //   }
    // }, [undo, onUpdate]);

    // It DOES rely on the return value.
    // If I use useReducer, I can't return the next state.
    // I have to hack it or change how SongEditor works.

    // Option 1: Change SongEditor to not rely on return value?
    // If we undo in hook, the hook state updates. But SongEditor explicitly calls `onUpdate` with the lyrics.
    // The `useLyricsHistory` seems to maintain its own history, separate from the `song.lyrics` passed as prop?
    // Yes, `SongEditor` syncs them: `onUpdate({ lyrics: newLyrics })` which updates the song in parent, which passes new lyrics to `SongEditor`.
    // And `useEffect` in `SongEditor` resets history?
    //   useEffect(() => {
    //     resetHistory(song.lyrics);
    //   }, [song.id, resetHistory]);
    // It only resets on `song.id` change. So local history is preserved during edits.

    // The `undo` in `SongEditor` calls `undo()` from hook, gets lyrics, then calls `onUpdate`.
    // This implies `onUpdate` is the source of truth for the *current* lyrics displayed (via `song` prop).
    // The history hook is just a history manager.

    // If I change `undo` to not return anything, `SongEditor` won't know what the new lyrics are to call `onUpdate`.
    // `useLyricsHistory` could expose `history[currentIndex].lyrics`.
    // But `undo` action happens, render happens, then we see new lyrics.
    // `SongEditor` needs to push that change to `onUpdate`?
    // Or `SongEditor` should observe `state.history[state.currentIndex].lyrics` and call `onUpdate`?
    // No, strictly `useLyricsHistory` is a utility.

    // To keep API compatible: `undo` needs access to state to calculate next index and return it.
    // We can use a ref to keep track of current state for synchronous returns in `undo/redo` wrappers?
    // Or just peek at the state provided by `useReducer`? `state` is available in the hook body.
    // But `dispatch` doesn't update `state` variable in the current closure. `state` is from the *previous* render.
    // So `undo` would see the *current* state (historically), calculate `currentIndex - 1`, verify it's valid, dispatch UNDO, AND return the lyrics at `currentIndex - 1`.

    dispatch({ type: 'UNDO' });

    if (state.currentIndex <= 0) return null;
    return state.history[state.currentIndex - 1].lyrics;
  }, [state.currentIndex, state.history]); // Adding deps makes it unstable?
  // If I add deps, it's not stable. The original used Refs to be stable.
  // We can use Refs here too to keep `undo` stable but access current state.

  // Implementation with Refs for stability + useReducer for state logic.

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const undoStable = useCallback((): LyricLine[] | null => {
    const { currentIndex, history } = stateRef.current;
    if (currentIndex <= 0) return null;

    const newIndex = currentIndex - 1;
    const lyrics = history[newIndex].lyrics;

    dispatch({ type: 'UNDO' });
    return lyrics;
  }, []); // Stable!

  const redoStable = useCallback((): LyricLine[] | null => {
    const { currentIndex, history } = stateRef.current;
    if (currentIndex >= history.length - 1) return null;

    const newIndex = currentIndex + 1;
    const lyrics = history[newIndex].lyrics;

    dispatch({ type: 'REDO' });
    return lyrics;
  }, []); // Stable!

  const pushStateStable = useCallback((lyrics: LyricLine[], forceNew = false) => {
    dispatch({ type: 'PUSH', lyrics, forceNew, timestamp: Date.now() });
  }, []);

  const resetHistoryStable = useCallback((lyrics: LyricLine[]) => {
    dispatch({ type: 'RESET', lyrics, timestamp: Date.now() });
  }, []);

  return {
    pushState: pushStateStable,
    undo: undoStable,
    redo: redoStable,
    canUndo: state.currentIndex > 0,
    canRedo: state.currentIndex < state.history.length - 1,
    resetHistory: resetHistoryStable,
    historyLength: state.history.length,
    currentIndex: state.currentIndex,
  };
}
