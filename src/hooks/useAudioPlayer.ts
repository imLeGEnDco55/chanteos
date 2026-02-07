import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioPlayerState } from '@/types/song';

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5];
const SKIP_SECONDS = 3;

export function useAudioPlayer(audioData: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    isLooping: false,
  });

  // Crear/actualizar el elemento de audio cuando cambia audioData
  useEffect(() => {
    if (!audioData) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0, duration: 0 }));
      return;
    }

    const audio = new Audio(audioData);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleEnded = () => {
      if (!state.isLooping) {
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioData]);

  // Sincronizar playbackRate y loop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = state.playbackRate;
      audioRef.current.loop = state.isLooping;
    }
  }, [state.playbackRate, state.isLooping]);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
      audioRef.current.currentTime = clampedTime;
      setState(prev => ({ ...prev, currentTime: clampedTime }));
    }
  }, []);

  const skipBack = useCallback(() => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - SKIP_SECONDS);
      audioRef.current.currentTime = newTime;
      setState(prev => ({ ...prev, currentTime: newTime }));
    }
  }, []);

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + SKIP_SECONDS);
      audioRef.current.currentTime = newTime;
      setState(prev => ({ ...prev, currentTime: newTime }));
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    setState(prev => {
      const currentIndex = PLAYBACK_RATES.indexOf(prev.playbackRate);
      const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
      return { ...prev, playbackRate: PLAYBACK_RATES[nextIndex] };
    });
  }, []);

  const toggleLoop = useCallback(() => {
    setState(prev => ({ ...prev, isLooping: !prev.isLooping }));
  }, []);

  const getCurrentTime = useCallback((): number => {
    return audioRef.current?.currentTime ?? 0;
  }, []);

  return {
    ...state,
    play,
    pause,
    togglePlay,
    seek,
    skipBack,
    skipForward,
    setPlaybackRate,
    cyclePlaybackRate,
    toggleLoop,
    getCurrentTime,
    hasAudio: !!audioData,
  };
}
