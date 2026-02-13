import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioPlayerState, LoopState } from '@/types/song';

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5];
const SKIP_SECONDS = 3;

export function useAudioPlayer(audioData: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    loopState: 'off',
    loopPointA: null,
    loopPointB: null,
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
      const currentTime = audio.currentTime;
      setState(prev => {
        // Check if we need to loop back to point A
        if (prev.loopState === 'loop-ab' && prev.loopPointA !== null && prev.loopPointB !== null) {
          if (currentTime >= prev.loopPointB) {
            audio.currentTime = prev.loopPointA;
            return { ...prev, currentTime: prev.loopPointA };
          }
        }
        return { ...prev, currentTime };
      });
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
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

  // Sincronizar playbackRate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = state.playbackRate;
    }
  }, [state.playbackRate]);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (state.loopState === 'point-a' && state.loopPointA !== null && audioRef.current) {
      // Cue mode: always restart from A — no pause, ever
      audioRef.current.pause();
      audioRef.current.currentTime = state.loopPointA;
      setState(prev => ({ ...prev, currentTime: state.loopPointA! }));
      audioRef.current.play();
    } else if (state.loopState === 'loop-ab' && state.loopPointA !== null && audioRef.current) {
      // Loop A-B: pause works, but unpause always restarts from A
      if (state.isPlaying) {
        pause();
      } else {
        audioRef.current.currentTime = state.loopPointA;
        setState(prev => ({ ...prev, currentTime: state.loopPointA! }));
        play();
      }
    } else if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, state.loopState, state.loopPointA, play, pause]);

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

  // Cycle through loop states: off -> point-a -> loop-ab -> off
  const cycleLoopState = useCallback(() => {
    setState(prev => {
      const currentTime = audioRef.current?.currentTime ?? 0;

      if (prev.loopState === 'off') {
        // Set point A
        return { ...prev, loopState: 'point-a' as LoopState, loopPointA: currentTime, loopPointB: null };
      } else if (prev.loopState === 'point-a') {
        // Set point B (must be after point A)
        const pointB = Math.max(currentTime, (prev.loopPointA ?? 0) + 0.5);
        return { ...prev, loopState: 'loop-ab' as LoopState, loopPointB: pointB };
      } else {
        // Reset to off
        return { ...prev, loopState: 'off' as LoopState, loopPointA: null, loopPointB: null };
      }
    });
  }, []);

  // Direct reset to off (for long-press)
  const resetLoop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState(prev => ({ ...prev, loopState: 'off' as LoopState, loopPointA: null, loopPointB: null, isPlaying: false }));
  }, []);

  // Legacy toggle for compatibility (now just cycles)
  const toggleLoop = useCallback(() => {
    cycleLoopState();
  }, [cycleLoopState]);

  const getCurrentTime = useCallback((): number => {
    return audioRef.current?.currentTime ?? 0;
  }, []);

  return {
    ...state,
    audioElement: audioRef.current,
    play,
    pause,
    togglePlay,
    seek,
    skipBack,
    skipForward,
    setPlaybackRate,
    cyclePlaybackRate,
    toggleLoop,
    cycleLoopState,
    resetLoop,
    getCurrentTime,
    hasAudio: !!audioData,
  };
}
