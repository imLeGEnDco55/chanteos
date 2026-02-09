import { Play, Pause, Repeat, Music, RotateCcw, RotateCw, Hash, Undo2, ChevronUp, ChevronDown } from 'lucide-react';
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
  onLoadAudio: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  onMarkTimestamp?: () => void;
  onOpenPromptLibrary?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
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
  onLoadAudio,
  onSkipBack,
  onSkipForward,
  onMarkTimestamp,
  onOpenPromptLibrary,
  onUndo,
  canUndo = false,
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

  if (!hasAudio) {
    return (
      <div
        className="w-full bg-zinc-900/90 backdrop-blur-xl border-t border-white/5 p-4 safe-area-bottom pb-8"
        style={{ marginBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px' }}
      >
        <Button
          onClick={onLoadAudio}
          variant="secondary"
          className="w-full gap-2 h-12 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
        >
          <Music className="h-5 w-5" />
          Cargar Audio para Empezar
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
      className="w-full bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 safe-area-bottom transition-all duration-150 relative pb-6"
      style={{ marginBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px' }}
      onMouseDown={preventFocusLoss}
      onTouchStart={preventFocusLoss}
    >
      {/* Swipe handle to toggle rhyme panel */}
      <button
        type="button"
        className="w-full flex justify-center py-2 cursor-pointer focus:outline-none focus-visible:bg-white/5 hover:bg-white/5 transition-colors absolute -top-4 left-0 right-0 h-4 z-10"
        onClick={onToggleRhymePanel}
        aria-label={showRhymePanel ? "Ocultar panel de rimas" : "Mostrar panel de rimas"}
      >
        {showRhymePanel ? (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        ) : (
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        )}
      </button>

      {/* Rhyme suggestions panel */}
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

      {/* Progress bar with time labels */}
      <div className="px-0 pt-0 -mt-1.5 relative z-10 group">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={([value]) => {
            const time = (value / 100) * duration;
            onSeek(time);
          }}
          className="cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-none [&_.bg-primary]:bg-primary/80 [&_[data-orientation=horizontal]]:h-1 hover:[&_[data-orientation=horizontal]]:h-2 transition-all"
        />
        <div className="flex justify-between px-4 mt-1">
          <span className="text-[10px] text-zinc-500 font-mono">
            {formatTime(currentTime)}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-1 px-4 py-2">
        {/* Left Group */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenPromptLibrary}
            className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-white/5"
            title="Librería"
          >
            <Music className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "h-10 w-10 hover:bg-white/5",
              canUndo ? "text-zinc-400 hover:text-white" : "text-zinc-700"
            )}
            title="Deshacer"
          >
            <Undo2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Center Group - Playback */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipBack}
            className="h-10 w-10 text-zinc-300 hover:text-white hover:bg-white/10 relative rounded-full"
          >
            <RotateCcw className="h-6 w-6" />
            <span className="absolute text-[9px] font-bold top-[11px] left-[13px] text-zinc-950">3</span>
          </Button>

          <Button
            onClick={onTogglePlay}
            size="icon"
            className="h-14 w-14 rounded-full bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all shadow-lg shadow-white/10"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 fill-current ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipForward}
            className="h-10 w-10 text-zinc-300 hover:text-white hover:bg-white/10 relative rounded-full"
          >
            <RotateCw className="h-6 w-6" />
            <span className="absolute text-[9px] font-bold top-[11px] left-[13px] text-zinc-950">3</span>
          </Button>
        </div>

        {/* Right Group */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCycleLoopState}
            className={cn(
              "h-10 w-10 hover:bg-white/5 transition-colors relative",
              loopState === 'off' && "text-zinc-500",
              loopState === 'point-a' && "text-yellow-400 bg-yellow-400/10",
              loopState === 'loop-ab' && "text-green-400 bg-green-400/10"
            )}
          >
            <Repeat className="h-5 w-5" />
            {loopState === 'point-a' && (
              <span className="absolute bottom-1 right-2 text-[8px] font-bold">A</span>
            )}
            {loopState === 'loop-ab' && (
              <span className="absolute bottom-1 right-1.5 text-[8px] font-bold">AB</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onMarkTimestamp}
            className="h-10 w-10 text-primary hover:text-primary hover:bg-primary/10"
            title="Timestamp"
          >
            <Hash className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
