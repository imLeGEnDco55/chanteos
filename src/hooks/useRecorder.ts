import { useState, useRef, useCallback, useEffect } from 'react';

const MAX_VOICES = 2;

export interface VoiceEntry {
    blob: Blob;
    startTime: number; // maketa time (seconds) when recording began
}

interface RecorderState {
    isRecording: boolean;
    voices: [VoiceEntry | null, VoiceEntry | null];
    activeVoice: 0 | 1;
    hasPermission: boolean | null;
}

/**
 * @param getMaketaTime - function returning the maketa's current playback time
 */
export function useRecorder(getMaketaTime?: () => number) {
    const [state, setState] = useState<RecorderState>({
        isRecording: false,
        voices: [null, null],
        activeVoice: 0,
        hasPermission: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const isRecordingRef = useRef(false);
    const stopRequestedRef = useRef(false); // Guards async race: pointerUp before mic ready
    const recordStartTimeRef = useRef(0); // maketa time at rec start

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const startRecording = useCallback(async () => {
        if (isRecordingRef.current) {
            console.warn('[Recorder] Already recording, ignoring');
            return;
        }

        // Reset stop guard
        stopRequestedRef.current = false;

        // Capture maketa time at recording start
        recordStartTimeRef.current = getMaketaTime?.() ?? 0;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            streamRef.current = stream;

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onerror = () => {
                console.error('[Recorder] MediaRecorder error, forcing stop');
                stopRecording();
            };

            const capturedStartTime = recordStartTimeRef.current;

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                chunksRef.current = [];

                if (blob.size > 0) {
                    setState(prev => {
                        const nextVoice = prev.activeVoice;
                        const newVoices: [VoiceEntry | null, VoiceEntry | null] = [...prev.voices];
                        newVoices[nextVoice] = {
                            blob,
                            startTime: capturedStartTime,
                        };

                        console.log(
                            `[Recorder] Voice ${nextVoice} saved: ${(blob.size / 1024).toFixed(1)}KB @ ${capturedStartTime.toFixed(1)}s`
                        );

                        return {
                            ...prev,
                            isRecording: false,
                            voices: newVoices,
                            activeVoice: ((nextVoice + 1) % MAX_VOICES) as 0 | 1,
                        };
                    });
                } else {
                    setState(prev => ({ ...prev, isRecording: false }));
                }

                stream.getTracks().forEach(t => t.stop());
            };

            recorder.start(100);
            isRecordingRef.current = true;
            setState(prev => ({
                ...prev,
                isRecording: true,
                hasPermission: true,
            }));

            console.log(`[Recorder] Started @ maketa ${capturedStartTime.toFixed(1)}s`);

            // Check if stop was requested while we were waiting for getUserMedia
            if (stopRequestedRef.current) {
                console.log('[Recorder] Stop was requested during init, stopping now');
                stopRequestedRef.current = false;
                if (recorder.state === 'recording') {
                    isRecordingRef.current = false;
                    recorder.stop();
                }
            }
        } catch (error) {
            console.error('[Recorder] Failed to start:', error);
            isRecordingRef.current = false;
            setState(prev => ({
                ...prev,
                isRecording: false,
                hasPermission: false,
            }));
        }
    }, [getMaketaTime]);

    const stopRecording = useCallback(() => {
        if (!isRecordingRef.current) {
            // Recording hasn't started yet (async getUserMedia pending)
            // Set flag so startRecording auto-stops when ready
            stopRequestedRef.current = true;
            console.log('[Recorder] Stop requested (recording not yet active)');
            return;
        }

        isRecordingRef.current = false;

        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            console.log('[Recorder] Stopped');
        } else {
            setState(prev => ({ ...prev, isRecording: false }));
        }
    }, []);

    const clearVoices = useCallback(() => {
        setState(prev => ({
            ...prev,
            voices: [null, null],
            activeVoice: 0,
        }));
        console.log('[Recorder] Voices cleared');
    }, []);

    return {
        isRecording: state.isRecording,
        voices: state.voices,
        activeVoice: state.activeVoice,
        hasPermission: state.hasPermission,
        startRecording,
        stopRecording,
        clearVoices,
    };
}
