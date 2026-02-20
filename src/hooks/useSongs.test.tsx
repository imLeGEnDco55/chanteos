import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock audioStorage
const mockLoadAudioFromIndexedDB = vi.fn().mockResolvedValue({ blobUrl: 'blob:song1', fileName: 'song1.mp3' });

vi.mock('@/lib/audioStorage', () => ({
  loadAllAudioFromIndexedDB: vi.fn().mockResolvedValue(new Map()),
  loadAudioFromIndexedDB: (...args: unknown[]) => mockLoadAudioFromIndexedDB(...args),
  saveAudioToIndexedDB: vi.fn(),
  deleteAudioFromIndexedDB: vi.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('useSongs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadAudioFromIndexedDB.mockClear();
    localStorageMock.clear();
    vi.resetModules();
  });

  it('loads songs from localStorage WITHOUT loading audio on mount (lazy loading)', async () => {
    const { useSongs } = await import('./useSongs');

    // Setup initial localStorage state
    const initialSongs = [
      {
        id: 'song1',
        title: 'Test Song',
        lyrics: [],
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        hasAudio: true,
        audioFileName: 'song1.mp3',
      },
    ];
    localStorageMock.setItem('songwriting-notebook-songs', JSON.stringify(initialSongs));

    const { result } = renderHook(() => useSongs());

    // Wait for initial load
    await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
    });

    // Verify loadAllAudioFromIndexedDB was NOT called
    const { loadAllAudioFromIndexedDB } = await import('@/lib/audioStorage');
    expect(loadAllAudioFromIndexedDB).not.toHaveBeenCalled();

    // Verify songs are loaded without audio data initially
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0].audioData).toBe('');
  });

  it('loads audio when loadSongAudio is called', async () => {
    const { useSongs } = await import('./useSongs');

    const initialSongs = [
      {
        id: 'song1',
        title: 'Test Song',
        lyrics: [],
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        hasAudio: true,
        audioFileName: 'song1.mp3',
      },
    ];
    localStorageMock.setItem('songwriting-notebook-songs', JSON.stringify(initialSongs));

    const { result } = renderHook(() => useSongs());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    // Verify initial state
    expect(result.current.songs[0].audioData).toBe('');

    // Trigger lazy load
    await act(async () => {
      await result.current.loadSongAudio('song1');
    });

    // Verify loadAudioFromIndexedDB was called
    expect(mockLoadAudioFromIndexedDB).toHaveBeenCalledWith('song1');

    // Verify state updated
    await waitFor(() => {
        expect(result.current.songs[0].audioData).toBe('blob:song1');
    });
  });

  it('uses cached audio if available', async () => {
    const { useSongs } = await import('./useSongs');

    const initialSongs = [
        {
          id: 'song1',
          title: 'Test Song',
          lyrics: [],
          notes: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          hasAudio: true,
          audioFileName: 'song1.mp3',
        },
      ];
      localStorageMock.setItem('songwriting-notebook-songs', JSON.stringify(initialSongs));

      const { result } = renderHook(() => useSongs());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // First load
      await act(async () => {
        await result.current.loadSongAudio('song1');
      });
      expect(mockLoadAudioFromIndexedDB).toHaveBeenCalledTimes(1);

      // Reset mock to ensure next call is clean
      mockLoadAudioFromIndexedDB.mockClear();

      // Second load (should use cache)
      // Note: we are using the SAME result/hook instance, so the module-level cache should persist.
      await act(async () => {
        await result.current.loadSongAudio('song1');
      });

      expect(mockLoadAudioFromIndexedDB).not.toHaveBeenCalled();

      // State should still be correct
      expect(result.current.songs[0].audioData).toBe('blob:song1');
  });
});
