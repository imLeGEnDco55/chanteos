import { Play, Pause, Repeat, Music } from 'lucide-react';
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
}: AudioPlayerProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!hasAudio) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 safe-area-bottom">
        <Button 
          onClick={onLoadAudio}
          variant="outline" 
          className="w-full gap-2"
        >
          <Music className="h-4 w-4" />
          Cargar audio
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom">
      {/* Progress bar - clickable para seek */}
      <div className="px-3 pt-2">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={([value]) => {
            const time = (value / 100) * duration;
            onSeek(time);
          }}
          className="h-1"
        />
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Time display */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[70px]">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Center controls */}
        <div className="flex items-center gap-1">
          {/* Loop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleLoop}
            className={cn(
              "h-9 w-9",
              isLooping && "text-primary bg-primary/10"
            )}
          >
            <Repeat className="h-4 w-4" />
          </Button>

          {/* Play/Pause */}
          <Button
            variant="default"
            size="icon"
            onClick={onTogglePlay}
            className="h-11 w-11 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          {/* Playback rate */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCyclePlaybackRate}
            className="h-9 px-2 text-xs font-mono min-w-[45px]"
          >
            {playbackRate}x
          </Button>
        </div>

        {/* File name */}
        <div className="min-w-[70px] text-right">
          <p className="text-xs text-muted-foreground truncate max-w-[70px]">
            {audioFileName || 'Audio'}
          </p>
        </div>
      </div>
    </div>
  );
}
