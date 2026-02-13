import { useState, useRef, useCallback, useEffect } from 'react';

const MAX_VOICES = 2;

interface RecorderState {
    isRecording: boolean;
    voiceBuffers: [Blob | null, Blob | null];
    activeVoice: 0 | 1;
    hasPermission: boolean | null; // null = not yet requested
}

export function useRecorder() {
    const [state, setState] = useState<RecorderState>({
        isRecording: false,
        voiceBuffers: [null, null],
        activeVoice: 0,
        hasPermission: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const isRecordingRef = useRef(false); // Mirror for sync checks

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
        // Guard: already recording
        if (isRecordingRef.current) {
            console.warn('[Recorder] Already recording, ignoring');
            return;
        }

        try {
            // Request mic — browser will remember permission
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            streamRef.current = stream;

            // Choose codec — prefer opus, fallback to whatever browser supports
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

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                chunksRef.current = [];

                if (blob.size > 0) {
                    setState(prev => {
                        const nextVoice = prev.activeVoice;
                        const newBuffers: [Blob | null, Blob | null] = [...prev.voiceBuffers];
                        newBuffers[nextVoice] = blob;

                        console.log(
                            `[Recorder] Voice ${nextVoice} saved: ${(blob.size / 1024).toFixed(1)}KB`
                        );

                        return {
                            ...prev,
                            isRecording: false,
                            voiceBuffers: newBuffers,
                            activeVoice: ((nextVoice + 1) % MAX_VOICES) as 0 | 1,
                        };
                    });
                } else {
                    setState(prev => ({ ...prev, isRecording: false }));
                }

                // Stop mic tracks to release hardware
                stream.getTracks().forEach(t => t.stop());
            };

            recorder.start(100); // Collect data every 100ms
            isRecordingRef.current = true;
            setState(prev => ({
                ...prev,
                isRecording: true,
                hasPermission: true,
            }));

            console.log('[Recorder] Started');
        } catch (error) {
            console.error('[Recorder] Failed to start:', error);
            isRecordingRef.current = false;
            setState(prev => ({
                ...prev,
                isRecording: false,
                hasPermission: false,
            }));
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (!isRecordingRef.current) return;

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
            voiceBuffers: [null, null],
            activeVoice: 0,
        }));
        console.log('[Recorder] Voices cleared');
    }, []);

    return {
        isRecording: state.isRecording,
        voiceBuffers: state.voiceBuffers,
        activeVoice: state.activeVoice,
        hasPermission: state.hasPermission,
        startRecording,
        stopRecording,
        clearVoices,
    };
}
