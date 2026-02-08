import { Plus, ChevronLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LyricLine } from './LyricLine';
import { AudioPlayer } from './AudioPlayer';
import { ThemeToggle } from './ThemeToggle';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { createEmptyLine } from '@/hooks/useSongs';
import { formatTime, parseTime } from '@/lib/syllables';
import type { Song, LyricLine as LyricLineType } from '@/types/song';
import { useRef, useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SongEditorProps {
  song: Song;
  onBack: () => void;
  onUpdate: (updates: Partial<Song>, audioFile?: File) => void;
}

export function SongEditor({ song, onBack, onUpdate }: SongEditorProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [focusedLineIndex, setFocusedLineIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const player = useAudioPlayer(song.audioData || null);

  // Find the active line based on current playback time
  const activeLineIndex = useMemo(() => {
    if (!player.isPlaying && player.currentTime === 0) return -1;
    
    // Find the last line whose timestamp is <= current time
    let activeIndex = -1;
    for (let i = 0; i < song.lyrics.length; i++) {
      const line = song.lyrics[i];
      if (line.timestamp) {
        const lineTime = parseTime(line.timestamp);
        if (lineTime <= player.currentTime) {
          activeIndex = i;
        } else {
          break;
        }
      }
    }
    return activeIndex;
  }, [player.currentTime, player.isPlaying, song.lyrics]);

  const handleAddLine = () => {
    const newLyrics = [...song.lyrics, createEmptyLine()];
    onUpdate({ lyrics: newLyrics });
  };

  const handleUpdateLine = (index: number, updatedLine: LyricLineType) => {
    const newLyrics = [...song.lyrics];
    newLyrics[index] = updatedLine;
    onUpdate({ lyrics: newLyrics });
  };

  const handleDeleteLine = (index: number) => {
    if (song.lyrics.length <= 1) return;
    const newLyrics = song.lyrics.filter((_, i) => i !== index);
    onUpdate({ lyrics: newLyrics });
  };

  const handleMarkTimestamp = (index: number) => {
    const currentTime = player.getCurrentTime();
    const timestamp = formatTime(currentTime);
    const newLyrics = [...song.lyrics];
    newLyrics[index] = { ...newLyrics[index], timestamp };
    onUpdate({ lyrics: newLyrics });
  };

  // Smart timestamp: if a line is focused, add timestamp to it; otherwise create new line
  const handleSmartTimestamp = useCallback(() => {
    const currentTime = player.getCurrentTime();
    const timestamp = formatTime(currentTime);
    
    if (focusedLineIndex !== null && focusedLineIndex < song.lyrics.length) {
      // Add timestamp to focused line
      const newLyrics = [...song.lyrics];
      newLyrics[focusedLineIndex] = { ...newLyrics[focusedLineIndex], timestamp };
      onUpdate({ lyrics: newLyrics });
    } else {
      // Create new line with timestamp
      const newLine = { ...createEmptyLine(), timestamp };
      const newLyrics = [...song.lyrics, newLine];
      onUpdate({ lyrics: newLyrics });
    }
  }, [focusedLineIndex, song.lyrics, player, onUpdate]);

  const handleLoadAudio = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpdate({}, file);
  };

  // Total syllables
  const totalSyllables = song.lyrics.reduce((sum, line) => sum + line.syllableCount, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 p-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <Input
            type="text"
            value={song.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="text-lg font-bold bg-transparent border-none focus-visible:ring-1 px-0"
            placeholder="Título de la canción"
          />
          {song.audioFileName && (
            <p className="text-xs text-accent font-medium uppercase tracking-wide truncate">
              {song.audioFileName.replace(/\.[^/.]+$/, '')}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowNotes(!showNotes)}>
              {showNotes ? 'Ver letras' : 'Ver notas'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLoadAudio}>
              Cambiar audio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </header>

      {/* Content */}
      <ScrollArea className="flex-1 pb-32">
        {showNotes ? (
          <div className="p-4">
            <Textarea
              value={song.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Notas sobre la canción..."
              className="min-h-[200px] resize-none"
            />
          </div>
        ) : (
          <div className="py-2">
            {/* Lyrics lines */}
            {song.lyrics.map((line, index) => (
              <div
                key={line.id}
                className={cn(
                  "transition-colors duration-200",
                  activeLineIndex === index && "bg-primary/10"
                )}
              >
                <LyricLine
                  line={line}
                  onUpdate={(updated) => handleUpdateLine(index, updated)}
                  onDelete={() => handleDeleteLine(index)}
                  onMarkTimestamp={() => handleMarkTimestamp(index)}
                  onFocus={() => setFocusedLineIndex(index)}
                  onBlur={() => setFocusedLineIndex(null)}
                  canDelete={song.lyrics.length > 1}
                  isActive={activeLineIndex === index}
                />
              </div>
            ))}

            {/* Add line button */}
            <Button
              variant="ghost"
              onClick={handleAddLine}
              className="w-full mt-2 gap-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Agregar línea
            </Button>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>{song.lyrics.length} líneas</span>
              <span>•</span>
              <span>{totalSyllables} sílabas</span>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Audio Player */}
      <AudioPlayer
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        playbackRate={player.playbackRate}
        loopState={player.loopState}
        loopPointA={player.loopPointA}
        loopPointB={player.loopPointB}
        hasAudio={player.hasAudio}
        audioFileName={song.audioFileName}
        onTogglePlay={player.togglePlay}
        onSeek={player.seek}
        onCyclePlaybackRate={player.cyclePlaybackRate}
        onCycleLoopState={player.cycleLoopState}
        onLoadAudio={handleLoadAudio}
        onSkipBack={player.skipBack}
        onSkipForward={player.skipForward}
        onMarkTimestamp={handleSmartTimestamp}
      />
    </div>
  );
}
