export interface LyricLine {
  id: string;
  timestamp: string; // Format: "0:00" or "1:23"
  text: string;
  syllableCount: number;
}

export interface Song {
  id: string;
  title: string;
  audioFileName: string;
  audioData: string; // Base64 encoded audio
  lyrics: LyricLine[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export type LoopState = 'off' | 'point-a' | 'loop-ab';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  loopState: LoopState;
  loopPointA: number | null;
  loopPointB: number | null;
}
