import { memo, useCallback, useRef } from 'react';
import { Play, Pause, Repeat, Music, RotateCcw, RotateCw, Hash, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LoopState } from '@/types/song';

interface PlayerControlsProps {
  isPlaying: boolean;
  loopState: LoopState;
  canUndo?: boolean;
  onOpenPromptLibrary?: () => void;
  onUndo?: () => void;
  onSkipBack?: () => void;
  onTogglePlay: () => void;
  onSkipForward?: () => void;
  onCycleLoopState: () => void;
  onResetLoop?: () => void;
  onMarkTimestamp?: () => void;
}

export const PlayerControls = memo(function PlayerControls({
  isPlaying,
  loopState,
  canUndo,
  onOpenPromptLibrary,
  onUndo,
  onSkipBack,
  onTogglePlay,
  onSkipForward,
  onCycleLoopState,
  onResetLoop,
  onMarkTimestamp,
}: PlayerControlsProps) {
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

  return (
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

      {/* Play/Pause - Large central button */}
      <Button
        onClick={onTogglePlay}
        size="icon"
        className="h-14 w-14 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 mx-2"
        aria-label={
          isPlaying ? "Pausar" :
            loopState === 'point-a' ? "Reproducir desde Cue A" :
              loopState === 'loop-ab' ? "Reproducir desde inicio del loop" :
                "Reproducir"
        }
      >
        {isPlaying && loopState !== 'point-a' ? (
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
  );
});
