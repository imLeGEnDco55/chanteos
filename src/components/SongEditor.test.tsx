import { render, screen } from '@testing-library/react';
import { SongEditor } from './SongEditor';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useLyricsHistory } from '@/hooks/useLyricsHistory';
import { useRhymeSuggestions } from '@/hooks/useRhymeSuggestions';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Song } from '@/types/song';

// Mocks
vi.mock('@/hooks/useAudioPlayer');
vi.mock('@/hooks/useLyricsHistory');
vi.mock('@/hooks/useRhymeSuggestions');
vi.mock('@/hooks/useRecorder', () => ({
  useRecorder: () => ({ isRecording: false, startRecording: vi.fn(), stopRecording: vi.fn(), voices: [] })
}));
vi.mock('@/hooks/useVoiceMixer', () => ({
  useVoiceMixer: () => ({ hasVoices: false, voiceCount: 0, voicePlaying: false, voiceEnabled: true, toggleVoiceEnabled: vi.fn() })
}));

// Mock child components to simplify test and focus on logic
// We use a data attribute to verify the prop passed to LyricsList
vi.mock('./LyricsList', () => ({
  LyricsList: ({ activeLineIndex }: { activeLineIndex: number }) => (
    <div data-testid="lyrics-list" data-active-index={activeLineIndex}>LyricsList</div>
  )
}));
vi.mock('./AudioPlayer', () => ({
  AudioPlayer: () => <div>AudioPlayer</div>
}));
vi.mock('./PromptLibraryDialog', () => ({
  PromptLibraryDialog: () => <div>PromptLibraryDialog</div>
}));

// Setup default mocks
const mockUseAudioPlayer = useAudioPlayer as unknown as ReturnType<typeof vi.fn>;
const mockUseLyricsHistory = useLyricsHistory as unknown as ReturnType<typeof vi.fn>;
const mockUseRhymeSuggestions = useRhymeSuggestions as unknown as ReturnType<typeof vi.fn>;

describe('SongEditor', () => {
  const mockSong: Song = {
    id: '1',
    title: 'Test Song',
    lyrics: [
      { id: '1', text: 'Line 1', timestamp: '0:05', type: 'lyric', syllableCount: 0 },
      { id: '2', text: 'Line 2', timestamp: '0:10', type: 'lyric', syllableCount: 0 },
      { id: '3', text: 'Line 3', timestamp: '0:15', type: 'lyric', syllableCount: 0 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: '',
  };

  beforeEach(() => {
    mockUseAudioPlayer.mockReturnValue({
      isPlaying: true,
      currentTime: 0,
      duration: 100,
      getCurrentTime: vi.fn().mockReturnValue(0),
      togglePlay: vi.fn(),
      seek: vi.fn(),
      playbackRate: 1,
      loopState: 'off',
      // Add other required props if necessary, but SongEditor mainly uses these
    });

    mockUseLyricsHistory.mockReturnValue({
      pushState: vi.fn(),
      undo: vi.fn(),
      resetHistory: vi.fn(),
      canUndo: false,
    });

    mockUseRhymeSuggestions.mockReturnValue({
      fetchSuggestions: vi.fn(),
      suggestions: null,
      isLoading: false,
    });
  });

  it('calculates activeLineIndex correctly based on currentTime', () => {
    // Test case 1: 6 seconds (Line 1 active, because 6 >= 5 and 6 < 10)
    mockUseAudioPlayer.mockReturnValue({
      isPlaying: true,
      currentTime: 6,
      getCurrentTime: vi.fn().mockReturnValue(6),
      duration: 100,
    });

    const { rerender } = render(
      <SongEditor
        song={mockSong}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        prompts={[]}
      />
    );

    let lyricsList = screen.getByTestId('lyrics-list');
    expect(lyricsList).toHaveAttribute('data-active-index', '0');

    // Test case 2: 12 seconds (Line 2 active, because 12 >= 10 and 12 < 15)
    mockUseAudioPlayer.mockReturnValue({
      isPlaying: true,
      currentTime: 12,
      getCurrentTime: vi.fn().mockReturnValue(12),
      duration: 100,
    });

    // Re-render with new mock return value
    // Note: In real React, the hook would update state. Here we simulate re-render with new hook values.
    rerender(
      <SongEditor
        song={mockSong}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        prompts={[]}
      />
    );

    lyricsList = screen.getByTestId('lyrics-list');
    expect(lyricsList).toHaveAttribute('data-active-index', '1');

    // Test case 3: 2 seconds (No line active yet, timestamps start at 5)
    mockUseAudioPlayer.mockReturnValue({
      isPlaying: true,
      currentTime: 2,
      getCurrentTime: vi.fn().mockReturnValue(2),
      duration: 100,
    });

    rerender(
      <SongEditor
        song={mockSong}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        prompts={[]}
      />
    );

    lyricsList = screen.getByTestId('lyrics-list');
    // Expect -1 because 2 < 5
    expect(lyricsList).toHaveAttribute('data-active-index', '-1');
  });
});
