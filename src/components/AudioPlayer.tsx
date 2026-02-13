import type { MouseEvent, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/syllables';
import { cn } from '@/lib/utils';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { RhymePanel } from './RhymePanel';
import { PlayerControls } from './PlayerControls';
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

const NO_OP = () => { };

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
  const preventFocusLoss = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="safe-area-bottom relative z-50 w-full shrink-0 overflow-hidden border-t border-white/10 bg-gradient-to-b from-primary to-primary/95 shadow-[0_-10px_30px_rgba(0,0,0,0.25)] transition-all duration-150"
      style={{ marginBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px' }}
      onMouseDown={preventFocusLoss}
      onTouchStart={preventFocusLoss}
    >
      {/* Player controls — always rendered */}
      <div className="relative">
        {/* Progress bar with time labels */}
        <div className="px-4 pt-2.5">
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
              className="flex-1 [&_[role=slider]]:border-0 [&_[role=slider]]:bg-primary-foreground [&_[data-orientation=horizontal]]:bg-primary-foreground/30 [&_.bg-primary]:bg-primary-foreground"
            />
            <span className="text-xs text-primary-foreground/80 font-mono min-w-[40px] text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <PlayerControls
          isPlaying={isPlaying}
          loopState={loopState}
          canUndo={canUndo}
          onOpenPromptLibrary={onOpenPromptLibrary}
          onUndo={onUndo}
          onSkipBack={onSkipBack}
          onTogglePlay={onTogglePlay}
          onSkipForward={onSkipForward}
          onCycleLoopState={onCycleLoopState}
          onResetLoop={onResetLoop}
          onMarkTimestamp={onMarkTimestamp}
        />
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
          onWordClick={onRhymeWordClick || NO_OP}
          onRetry={onRetryRhymes || NO_OP}
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
