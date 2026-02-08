import { Play, Pause, Repeat, Music, RotateCcw, RotateCw, Hash, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/syllables';
import { cn } from '@/lib/utils';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
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
  onLoadAudio: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  onMarkTimestamp?: () => void;
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
  onLoadAudio,
  onSkipBack,
  onSkipForward,
  onMarkTimestamp,
}: AudioPlayerProps) {
  const keyboardHeight = useKeyboardHeight();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Dynamic bottom position based on keyboard visibility
  const bottomStyle = keyboardHeight > 0 ? { bottom: `${keyboardHeight}px` } : {};

  if (!hasAudio) {
    return (
      <div 
        className="fixed left-0 right-0 bg-primary p-4 safe-area-bottom transition-all duration-150"
        style={{ bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px' }}
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
      className="fixed left-0 right-0 bg-primary safe-area-bottom transition-all duration-150"
      style={{ bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px' }}
      onMouseDown={preventFocusLoss}
      onTouchStart={preventFocusLoss}
    >
      {/* Progress bar with time labels */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-primary-foreground/80 font-mono min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={([value]) => {
              const time = (value / 100) * duration;
              onSeek(time);
            }}
            className="flex-1 [&_[role=slider]]:bg-primary-foreground [&_[role=slider]]:border-0 [&_.bg-primary]:bg-primary-foreground [&_[data-orientation=horizontal]]:bg-primary-foreground/30"
          />
          <span className="text-xs text-primary-foreground/80 font-mono min-w-[40px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>
      
      {/* Controls - matching mockup layout */}
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        {/* Prompts placeholder - future feature */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20 opacity-50"
          disabled
        >
          <Undo2 className="h-5 w-5" />
        </Button>

        {/* Undo placeholder - future feature */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20 opacity-50"
          disabled
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        {/* Skip back 3s */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSkipBack}
          className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20 relative"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="absolute text-[10px] font-bold">3</span>
        </Button>

        {/* Play/Pause - Large central button */}
        <Button
          onClick={onTogglePlay}
          size="icon"
          className="h-14 w-14 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 mx-2"
        >
          {isPlaying ? (
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
        >
          <RotateCw className="h-5 w-5" />
          <span className="absolute text-[10px] font-bold">3</span>
        </Button>

        {/* Loop A-B with color states */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCycleLoopState}
          className={cn(
            "h-10 w-10 hover:bg-primary-foreground/20 transition-colors",
            loopState === 'off' && "text-primary-foreground",
            loopState === 'point-a' && "text-yellow-400 bg-primary-foreground/10",
            loopState === 'loop-ab' && "text-green-400 bg-primary-foreground/20"
          )}
          title={
            loopState === 'off' ? 'Establecer punto A' :
            loopState === 'point-a' ? 'Establecer punto B' :
            'Desactivar loop'
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
        >
          <Hash className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
