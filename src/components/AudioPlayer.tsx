import { useRef, useCallback, useMemo } from 'react';
import { Play, Pause, Repeat, Music, RotateCcw, RotateCw, Hash, Undo2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/syllables';
import { cn } from '@/lib/utils';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { RhymePanel } from './RhymePanel';
import type { LoopState } from '@/types/song';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  loopState: LoopState;
  loopPointA: number | null;
  loopPointB: number | null;
  hasAudio: boolean;
  audioFileName?: string;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onCyclePlaybackRate: () => void;
  onCycleLoopState: () => void;
  onResetLoop?: () => void;
  onLoadAudio: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  onMarkTimestamp?: () => void;
  onOpenPromptLibrary?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  // PTR (Push To Rec) props
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  // Rhyme panel props
  showRhymePanel?: boolean;
  onToggleRhymePanel?: () => void;
  selectedWord?: string | null;
  rhymes?: string[];
  related?: string[];
  isLoadingRhymes?: boolean;
  rhymeError?: string | null;
  onRhymeWordClick?: (word: string) => void;
  onRetryRhymes?: () => void;
}

export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  loopState,
  loopPointA,
  loopPointB,
  hasAudio,
  audioFileName,
  onTogglePlay,
  onSeek,
  onCyclePlaybackRate,
  onCycleLoopState,
  onResetLoop,
  onLoadAudio,
  onSkipBack,
  onSkipForward,
  onMarkTimestamp,
  onOpenPromptLibrary,
  onUndo,
  canUndo = false,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  showRhymePanel = false,
  onToggleRhymePanel,
  selectedWord,
  rhymes = [],
  related = [],
  isLoadingRhymes = false,
  rhymeError,
  onRhymeWordClick,
  onRetryRhymes,
}: AudioPlayerProps) {
  const keyboardHeight = useKeyboardHeight();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const panelWidth = 'min(420px, 84vw)';

  // Long-press handler for loop button reset
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handleLoopPointerDown = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onResetLoop?.();
    }, 500);
  }, [onResetLoop]);

  const handleLoopPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!didLongPress.current) {
      onCycleLoopState();
    }
  }, [onCycleLoopState]);

  const handleLoopPointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // PTR (Push To Rec) — pointer events on Play button
  const MIN_PTR_DURATION = 120;
  const ptrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ptrActive = useRef(false);
  const ptrStartTime = useRef(0);

  const handlePlayPointerDown = useCallback(() => {
    ptrStartTime.current = Date.now();
    ptrActive.current = false;

    ptrTimer.current = setTimeout(() => {
      ptrActive.current = true;
      onStartRecording?.();
    }, MIN_PTR_DURATION);
  }, [onStartRecording]);

  const handlePlayPointerUp = useCallback(() => {
    if (ptrTimer.current) {
      clearTimeout(ptrTimer.current);
      ptrTimer.current = null;
    }

    if (ptrActive.current) {
      // Was recording → stop
      ptrActive.current = false;
      onStopRecording?.();
    } else {
      // Short tap → normal play/pause
      onTogglePlay();
    }
  }, [onTogglePlay, onStopRecording]);

  const handlePlayPointerCancel = useCallback(() => {
    if (ptrTimer.current) {
      clearTimeout(ptrTimer.current);
      ptrTimer.current = null;
    }
    if (ptrActive.current) {
      ptrActive.current = false;
      onStopRecording?.();
    }
  }, [onStopRecording]);

  // Inline rec-pulse animation style
  const recPulseStyle = useMemo(() => ({
    animation: isRecording ? 'rec-pulse 1s ease-in-out infinite' : undefined,
  }), [isRecording]);

  if (!hasAudio) {
    return (
      <div
        className="safe-area-bottom w-full shrink-0 border-t border-white/10 bg-primary p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.25)] transition-all duration-150"
        style={{ marginBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px' }}
      >
        <Button
          onClick={onLoadAudio}
          variant="secondary"
          className="w-full gap-2"
        >
          <Music className="h-4 w-4" />
          Cargar audio
        </Button>
      </div>
    );
  }

  // Prevent keyboard from closing when interacting with player controls
  const preventFocusLoss = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="safe-area-bottom relative z-50 w-full shrink-0 overflow-hidden border-t border-white/10 bg-gradient-to-b from-primary to-primary/95 shadow-[0_-10px_30px_rgba(0,0,0,0.25)] transition-all duration-150"
      style={{ marginBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px' }}
      onMouseDown={preventFocusLoss}
      onTouchStart={preventFocusLoss}
    >
      {/* Rec-pulse keyframes (injected once) */}
      <style>{`
        @keyframes rec-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 12px 6px rgba(239, 68, 68, 0.4); }
        }
        @keyframes rec-line-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Player controls — always rendered */}
      <div className="relative">
        {/* Progress bar with time labels */}
        <div className="px-4 pt-2.5">
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary-foreground/80 font-mono min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1">
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={([value]) => {
                  const time = (value / 100) * duration;
                  onSeek(time);
                }}
                className={cn(
                  "[&_[role=slider]]:border-0 [&_[role=slider]]:bg-primary-foreground [&_[data-orientation=horizontal]]:bg-primary-foreground/30 [&_.bg-primary]:bg-primary-foreground",
                  isRecording && "[&_.bg-primary]:bg-red-500"
                )}
              />
              {/* Rec line pulse */}
              {isRecording && (
                <div
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-red-500 rounded-full pointer-events-none"
                  style={{ animation: 'rec-line-pulse 1s ease-in-out infinite' }}
                />
              )}
            </div>
            <span className="text-xs text-primary-foreground/80 font-mono min-w-[40px] text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 px-4 py-3.5">
          {/* Prompt Library button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenPromptLibrary}
            className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20"
            title="Librería de prompts"
            aria-label="Abrir librería de prompts"
          >
            <Music className="h-5 w-5" />
          </Button>

          {/* Undo button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "h-10 w-10 hover:bg-primary-foreground/20",
              canUndo ? "text-primary-foreground" : "text-primary-foreground/30"
            )}
            title="Deshacer"
            aria-label="Deshacer último cambio"
          >
            <Undo2 className="h-5 w-5" />
          </Button>

          {/* Skip back 3s */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipBack}
            className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20 relative"
            aria-label="Retroceder 3 segundos"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="absolute text-[10px] font-bold">3</span>
          </Button>

          {/* Play/Pause - Large central button with PTR */}
          <Button
            onPointerDown={handlePlayPointerDown}
            onPointerUp={handlePlayPointerUp}
            onPointerCancel={handlePlayPointerCancel}
            onPointerLeave={handlePlayPointerCancel}
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full mx-2 select-none touch-none transition-all",
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            )}
            style={recPulseStyle}
            aria-label={
              isRecording ? "Grabando — suelta para detener" :
                isPlaying ? "Pausar" :
                  loopState === 'point-a' ? "Reproducir desde Cue A" :
                    loopState === 'loop-ab' ? "Reproducir desde inicio del loop" :
                      "Reproducir (mantener: grabar)"
            }
          >
            {isRecording ? (
              <div className="h-5 w-5 rounded-sm bg-white" />
            ) : isPlaying && loopState !== 'point-a' ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="h-7 w-7 ml-1" />
            )}
          </Button>

          {/* Skip forward 3s */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipForward}
            className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20 relative"
            aria-label="Adelantar 3 segundos"
          >
            <RotateCw className="h-5 w-5" />
            <span className="absolute text-[10px] font-bold">3</span>
          </Button>

          {/* Loop A-B with color states — long press to reset */}
          <Button
            variant="ghost"
            size="icon"
            onPointerDown={handleLoopPointerDown}
            onPointerUp={handleLoopPointerUp}
            onPointerLeave={handleLoopPointerLeave}
            className={cn(
              "h-10 w-10 hover:bg-primary-foreground/20 transition-colors select-none",
              loopState === 'off' && "text-primary-foreground",
              loopState === 'point-a' && "text-yellow-400 bg-primary-foreground/10",
              loopState === 'loop-ab' && "text-green-400 bg-primary-foreground/20"
            )}
            title={
              loopState === 'off' ? 'Establecer punto A' :
                loopState === 'point-a' ? 'Establecer punto B (mantener: reset)' :
                  'Desactivar loop (mantener: reset)'
            }
            aria-label={
              loopState === 'off' ? 'Establecer punto A de bucle' :
                loopState === 'point-a' ? 'Establecer punto B de bucle' :
                  'Desactivar bucle'
            }
          >
            <Repeat className="h-5 w-5" />
            {loopState === 'point-a' && (
              <span className="absolute text-[8px] font-bold text-yellow-400">A</span>
            )}
            {loopState === 'loop-ab' && (
              <span className="absolute text-[8px] font-bold text-green-400">AB</span>
            )}
          </Button>

          {/* Timestamp button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMarkTimestamp}
            className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20"
            title="Agregar timestamp a la línea actual"
            aria-label="Insertar marca de tiempo"
          >
            <Hash className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Rhyme panel — absolute overlay sliding from right */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full border-l border-primary-foreground/15 bg-primary/95 backdrop-blur-sm transition-transform duration-300 ease-in-out",
          showRhymePanel ? "translate-x-0" : "translate-x-full"
        )}
        style={{ width: panelWidth }}
      >
        <RhymePanel
          isVisible={showRhymePanel}
          selectedWord={selectedWord || null}
          rhymes={rhymes}
          related={related}
          isLoading={isLoadingRhymes}
          error={rhymeError || null}
          onWordClick={onRhymeWordClick || (() => { })}
          onRetry={onRetryRhymes || (() => { })}
        />
      </div>

      {/* Toggle tab on the edge — always visible */}
      <button
        type="button"
        className={cn(
          "absolute top-1/2 z-10 flex h-12 w-5 -translate-y-1/2 items-center justify-center rounded-l-md bg-primary-foreground/15 transition-all duration-300 ease-in-out hover:bg-primary-foreground/25",
        )}
        style={{ right: showRhymePanel ? panelWidth : '0px' }}
        onClick={onToggleRhymePanel}
        aria-label={showRhymePanel ? "Ocultar panel de rimas" : "Mostrar panel de rimas"}
      >
        {showRhymePanel ? (
          <ChevronRight className="h-4 w-4 text-primary-foreground/80" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-primary-foreground/80" />
        )}
      </button>
    </div>
  );
}
