import { useState, useRef, useCallback, useEffect } from 'react';
import type { VoiceEntry } from './useRecorder';

interface VoiceMixerState {
    voiceEnabled: boolean;
    voicePlaying: boolean;
}

/**
 * Mixes voice recordings over the maketa using AudioContext.
 * Voices automatically play at the maketa timestamp where they were recorded.
 */
export function useVoiceMixer(
    audioElement: HTMLAudioElement | null,
    voices: [VoiceEntry | null, VoiceEntry | null],
    isPlaying: boolean,
    currentTime: number
) {
    const [state, setState] = useState<VoiceMixerState>({
        voiceEnabled: true,
        voicePlaying: false,
    });

    // AudioContext and nodes
    const ctxRef = useRef<AudioContext | null>(null);
    const maketaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const maketaGainRef = useRef<GainNode | null>(null);
    const voiceGainRef = useRef<GainNode | null>(null);
    const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
    const decodedRef = useRef<[{ buffer: AudioBuffer; startTime: number } | null, { buffer: AudioBuffer; startTime: number } | null]>([null, null]);
    const connectedElementRef = useRef<HTMLAudioElement | null>(null);
    const triggeredRef = useRef<Set<number>>(new Set()); // voice indices already triggered this playback

    // Initialize AudioContext
    const ensureContext = useCallback(() => {
        if (!ctxRef.current) {
            ctxRef.current = new AudioContext();
            maketaGainRef.current = ctxRef.current.createGain();
            voiceGainRef.current = ctxRef.current.createGain();
            maketaGainRef.current.connect(ctxRef.current.destination);
            voiceGainRef.current.connect(ctxRef.current.destination);
        }
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume();
        }
        return ctxRef.current;
    }, []);

    // Connect maketa HTMLAudioElement (once per element)
    useEffect(() => {
        if (!audioElement || connectedElementRef.current === audioElement) return;
        const ctx = ensureContext();
        try {
            const source = ctx.createMediaElementSource(audioElement);
            maketaSourceRef.current = source;
            source.connect(maketaGainRef.current!);
            connectedElementRef.current = audioElement;
            console.log('[VoiceMixer] Maketa connected to AudioContext');
        } catch {
            console.log('[VoiceMixer] Maketa already connected');
        }
    }, [audioElement, ensureContext]);

    // Decode voice blobs when they change
    useEffect(() => {
        let cancelled = false;

        async function decode() {
            const ctx = ensureContext();
            for (let i = 0; i < 2; i++) {
                const voice = voices[i];
                if (!voice) {
                    decodedRef.current[i] = null;
                    continue;
                }
                try {
                    const arrayBuffer = await voice.blob.arrayBuffer();
                    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                    if (!cancelled) {
                        decodedRef.current[i] = {
                            buffer: audioBuffer,
                            startTime: voice.startTime,
                        };
                        console.log(`[VoiceMixer] Voice ${i} decoded: ${audioBuffer.duration.toFixed(1)}s @ ${voice.startTime.toFixed(1)}s`);
                    }
                } catch (err) {
                    console.error(`[VoiceMixer] Failed to decode voice ${i}:`, err);
                    decodedRef.current[i] = null;
                }
            }
        }

        decode();
        return () => { cancelled = true; };
    }, [voices, ensureContext]);

    // Stop all active voice sources
    const stopAllVoices = useCallback(() => {
        activeSourcesRef.current.forEach(src => {
            try { src.stop(); } catch { /* already stopped */ }
        });
        activeSourcesRef.current = [];
        setState(prev => ({ ...prev, voicePlaying: false }));
    }, []);

    // Play a voice at a specific offset (accounting for seek position)
    const triggerVoice = useCallback((voiceIndex: number, offset: number = 0) => {
        const ctx = ctxRef.current;
        const decoded = decodedRef.current[voiceIndex];
        if (!ctx || !decoded || !voiceGainRef.current) return;
        if (!state.voiceEnabled) return;

        const source = ctx.createBufferSource();
        source.buffer = decoded.buffer;
        source.connect(voiceGainRef.current);

        source.onended = () => {
            activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
            if (activeSourcesRef.current.length === 0) {
                setState(prev => ({ ...prev, voicePlaying: false }));
            }
        };

        // If offset > 0, skip into the voice buffer
        const clampedOffset = Math.min(offset, decoded.buffer.duration - 0.01);
        if (clampedOffset > 0) {
            source.start(0, clampedOffset);
        } else {
            source.start(0);
        }

        activeSourcesRef.current.push(source);
        setState(prev => ({ ...prev, voicePlaying: true }));
        console.log(`[VoiceMixer] Playing voice ${voiceIndex} (offset: ${clampedOffset.toFixed(1)}s)`);
    }, [state.voiceEnabled]);

    // Reset triggered set when playback stops
    useEffect(() => {
        if (!isPlaying) {
            triggeredRef.current.clear();
            stopAllVoices();
        }
    }, [isPlaying, stopAllVoices]);

    // Auto-trigger voices when maketa time crosses their startTime
    useEffect(() => {
        if (!isPlaying || !state.voiceEnabled) return;

        for (let i = 0; i < 2; i++) {
            const decoded = decodedRef.current[i];
            if (!decoded) continue;
            if (triggeredRef.current.has(i)) continue;

            const voiceStart = decoded.startTime;
            const voiceEnd = voiceStart + decoded.buffer.duration;

            // Check if current time is within the voice's time range
            if (currentTime >= voiceStart && currentTime < voiceEnd) {
                // Calculate offset into the voice buffer
                const offset = currentTime - voiceStart;
                triggeredRef.current.add(i);
                triggerVoice(i, offset);
            }
        }
    }, [currentTime, isPlaying, state.voiceEnabled, triggerVoice]);

    // Toggle voice enabled (mute/unmute)
    const toggleVoiceEnabled = useCallback(() => {
        setState(prev => {
            const next = !prev.voiceEnabled;
            if (voiceGainRef.current) {
                voiceGainRef.current.gain.value = next ? 1 : 0;
            }
            if (!next) {
                stopAllVoices();
            }
            return { ...prev, voiceEnabled: next };
        });
    }, [stopAllVoices]);

    const hasVoices = voices[0] !== null || voices[1] !== null;
    const voiceCount = (voices[0] ? 1 : 0) + (voices[1] ? 1 : 0);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            activeSourcesRef.current.forEach(src => {
                try { src.stop(); } catch { /* noop */ }
            });
            if (ctxRef.current) {
                ctxRef.current.close();
            }
        };
    }, []);

    return {
        voiceEnabled: state.voiceEnabled,
        voicePlaying: state.voicePlaying,
        hasVoices,
        voiceCount,
        toggleVoiceEnabled,
        stopAllVoices,
    };
}
