import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceMixerState {
    voiceEnabled: boolean;
    voicePlaying: boolean;
    activePlaybackVoice: number | null; // which voice slot is currently playing
}

/**
 * Mixes voice recordings over the maketa using AudioContext.
 * Connects the HTMLAudioElement (maketa) and voice Blobs to a shared AudioContext
 * so both play through speakers simultaneously.
 */
export function useVoiceMixer(
    audioElement: HTMLAudioElement | null,
    voiceBuffers: [Blob | null, Blob | null]
) {
    const [state, setState] = useState<VoiceMixerState>({
        voiceEnabled: true,
        voicePlaying: false,
        activePlaybackVoice: null,
    });

    // AudioContext and nodes — persist across renders
    const ctxRef = useRef<AudioContext | null>(null);
    const maketaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const maketaGainRef = useRef<GainNode | null>(null);
    const voiceSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const voiceGainRef = useRef<GainNode | null>(null);
    const decodedBuffersRef = useRef<[AudioBuffer | null, AudioBuffer | null]>([null, null]);
    const connectedElementRef = useRef<HTMLAudioElement | null>(null);

    // Initialize AudioContext and connect maketa
    const ensureContext = useCallback(() => {
        if (!ctxRef.current) {
            ctxRef.current = new AudioContext();
            maketaGainRef.current = ctxRef.current.createGain();
            voiceGainRef.current = ctxRef.current.createGain();
            maketaGainRef.current.connect(ctxRef.current.destination);
            voiceGainRef.current.connect(ctxRef.current.destination);
        }

        // Resume if suspended
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume();
        }

        return ctxRef.current;
    }, []);

    // Connect maketa HTMLAudioElement to AudioContext (once per element)
    useEffect(() => {
        if (!audioElement || connectedElementRef.current === audioElement) return;

        const ctx = ensureContext();

        // createMediaElementSource can only be called once per element
        try {
            const source = ctx.createMediaElementSource(audioElement);
            maketaSourceRef.current = source;
            source.connect(maketaGainRef.current!);
            connectedElementRef.current = audioElement;
            console.log('[VoiceMixer] Maketa connected to AudioContext');
        } catch {
            // Already connected (happens on HMR)
            console.log('[VoiceMixer] Maketa already connected');
        }
    }, [audioElement, ensureContext]);

    // Decode voice blobs into AudioBuffers when they change
    useEffect(() => {
        let cancelled = false;

        async function decode() {
            const ctx = ensureContext();

            for (let i = 0; i < 2; i++) {
                const blob = voiceBuffers[i];
                if (!blob) {
                    decodedBuffersRef.current[i] = null;
                    continue;
                }

                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                    if (!cancelled) {
                        decodedBuffersRef.current[i] = audioBuffer;
                        console.log(`[VoiceMixer] Voice ${i} decoded: ${audioBuffer.duration.toFixed(1)}s`);
                    }
                } catch (err) {
                    console.error(`[VoiceMixer] Failed to decode voice ${i}:`, err);
                    decodedBuffersRef.current[i] = null;
                }
            }
        }

        decode();
        return () => { cancelled = true; };
    }, [voiceBuffers, ensureContext]);

    // Play a specific voice buffer
    const playVoice = useCallback((voiceIndex: number) => {
        const ctx = ctxRef.current;
        const buffer = decodedBuffersRef.current[voiceIndex];
        if (!ctx || !buffer || !voiceGainRef.current) return;

        // Stop any currently playing voice
        if (voiceSourceRef.current) {
            try { voiceSourceRef.current.stop(); } catch { /* already stopped */ }
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(voiceGainRef.current);

        source.onended = () => {
            setState(prev => ({ ...prev, voicePlaying: false, activePlaybackVoice: null }));
        };

        source.start(0);
        voiceSourceRef.current = source;
        setState(prev => ({ ...prev, voicePlaying: true, activePlaybackVoice: voiceIndex }));
        console.log(`[VoiceMixer] Playing voice ${voiceIndex}`);
    }, []);

    // Stop current voice playback
    const stopVoice = useCallback(() => {
        if (voiceSourceRef.current) {
            try { voiceSourceRef.current.stop(); } catch { /* already stopped */ }
            voiceSourceRef.current = null;
        }
        setState(prev => ({ ...prev, voicePlaying: false, activePlaybackVoice: null }));
    }, []);

    // Toggle voice playback — play the most recent voice, or stop if playing
    const toggleVoice = useCallback(() => {
        if (state.voicePlaying) {
            stopVoice();
            return;
        }

        // Find most recently recorded voice (try slot that was last written)
        // activeVoice in recorder points to NEXT slot, so most recent = (activeVoice - 1 + 2) % 2
        // But we don't have activeVoice here, so just pick the first available
        for (let i = 0; i < 2; i++) {
            if (decodedBuffersRef.current[i]) {
                playVoice(i);
                return;
            }
        }
    }, [state.voicePlaying, stopVoice, playVoice]);

    // Toggle voice enabled (mute/unmute voice channel)
    const toggleVoiceEnabled = useCallback(() => {
        setState(prev => {
            const next = !prev.voiceEnabled;
            if (voiceGainRef.current) {
                voiceGainRef.current.gain.value = next ? 1 : 0;
            }
            return { ...prev, voiceEnabled: next };
        });
    }, []);

    // Check if we have any voices
    const hasVoices = voiceBuffers[0] !== null || voiceBuffers[1] !== null;
    const voiceCount = (voiceBuffers[0] ? 1 : 0) + (voiceBuffers[1] ? 1 : 0);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (voiceSourceRef.current) {
                try { voiceSourceRef.current.stop(); } catch { /* noop */ }
            }
            if (ctxRef.current) {
                ctxRef.current.close();
            }
        };
    }, []);

    return {
        voiceEnabled: state.voiceEnabled,
        voicePlaying: state.voicePlaying,
        activePlaybackVoice: state.activePlaybackVoice,
        hasVoices,
        voiceCount,
        playVoice,
        stopVoice,
        toggleVoice,
        toggleVoiceEnabled,
    };
}
