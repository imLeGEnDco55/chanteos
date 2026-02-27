import { render, screen } from '@testing-library/react';
import { SongEditor } from './SongEditor';
import { vi, describe, it, expect } from 'vitest';
import type { Song } from '@/types/song';

// Mock dependencies
vi.mock('@/hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    isPlaying: false,
    currentTime: 0,
    duration: 100,
    playbackRate: 1,
    loopState: 'off',
    loopPointA: null,
    loopPointB: null,
    hasAudio: false,
    audioElement: { current: null },
    togglePlay: vi.fn(),
    seek: vi.fn(),
    cyclePlaybackRate: vi.fn(),
    cycleLoopState: vi.fn(),
    resetLoop: vi.fn(),
    skipBack: vi.fn(),
    skipForward: vi.fn(),
    getCurrentTime: () => 0,
  }),
}));

vi.mock('@/hooks/useRecorder', () => ({
  useRecorder: () => ({
    isRecording: false,
    voices: [],
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
  }),
}));

vi.mock('@/hooks/useVoiceMixer', () => ({
  useVoiceMixer: () => ({
    hasVoices: false,
    voiceCount: 0,
    voicePlaying: false,
    voiceEnabled: false,
    toggleVoiceEnabled: vi.fn(),
  }),
}));

vi.mock('@/hooks/useLyricsHistory', () => ({
  useLyricsHistory: () => ({
    pushState: vi.fn(),
    undo: vi.fn(),
    resetHistory: vi.fn(),
    canUndo: false,
  }),
}));

vi.mock('@/hooks/useRhymeSuggestions', () => ({
  useRhymeSuggestions: () => ({
    suggestions: { rhymes: [], related: [] },
    isLoading: false,
    error: null,
    selectedWord: null,
    fetchSuggestions: vi.fn(),
    retry: vi.fn(),
  }),
}));

// Mock AudioPlayer component to simplify test
vi.mock('./AudioPlayer', () => ({
  AudioPlayer: () => <div data-testid="audio-player">Audio Player Mock</div>,
}));

// Mock LyricsList component to simplify test
vi.mock('./LyricsList', () => ({
  LyricsList: () => <div data-testid="lyrics-list">Lyrics List Mock</div>,
}));

describe('SongEditor Accessibility', () => {
  const mockSong: Song = {
    id: 'test-song-id',
    title: 'Test Song',
    audioFileName: 'test.mp3',
    audioData: '',
    lyrics: [],
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const defaultProps = {
    song: mockSong,
    onBack: vi.fn(),
    onUpdate: vi.fn(),
    prompts: [],
  };

  it('renders navigation buttons with accessible labels', () => {
    render(<SongEditor {...defaultProps} />);

    // These should initially fail if aria-labels are missing
    const backButton = screen.getByRole('button', { name: /volver/i });
    expect(backButton).toBeInTheDocument();

    const optionsButton = screen.getByRole('button', { name: /opciones de canción/i });
    expect(optionsButton).toBeInTheDocument();
  });
});
