import { Play, Pause, Repeat, Music, RotateCcw, RotateCw, Hash, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/syllables';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLooping: boolean;
  hasAudio: boolean;
  audioFileName?: string;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onCyclePlaybackRate: () => void;
  onToggleLoop: () => void;
  onLoadAudio: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
}

export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  isLooping,
  hasAudio,
  audioFileName,
  onTogglePlay,
  onSeek,
  onCyclePlaybackRate,
  onToggleLoop,
  onLoadAudio,
  onSkipBack,
  onSkipForward,
}: AudioPlayerProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!hasAudio) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-primary p-4 safe-area-bottom">
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary safe-area-bottom">
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
        {/* Lyrics/subtitle toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        {/* Skip back (general) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSeek(0)}
          className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20"
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

        {/* Loop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleLoop}
          className={cn(
            "h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20",
            isLooping && "bg-primary-foreground/20"
          )}
        >
          <Repeat className="h-5 w-5" />
        </Button>

        {/* Playback rate / Metadata */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCyclePlaybackRate}
          className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20"
        >
          <span className="text-xs font-bold">{playbackRate}x</span>
        </Button>
      </div>
    </div>
  );
}
