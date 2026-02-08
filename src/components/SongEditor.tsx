import { Plus, ChevronLeft, MoreVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LyricLine } from './LyricLine';
import { PromptLine } from './PromptLine';
import { AudioPlayer } from './AudioPlayer';
import { ThemeToggle } from './ThemeToggle';
import { PromptLibraryDialog } from './PromptLibraryDialog';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import { useLyricsHistory } from '@/hooks/useLyricsHistory';
import { createEmptyLine } from '@/hooks/useSongs';
import { formatTime, parseTime } from '@/lib/syllables';
import type { Song, LyricLine as LyricLineType } from '@/types/song';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
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
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [focusedLineIndex, setFocusedLineIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const player = useAudioPlayer(song.audioData || null);
  const promptLibrary = usePromptLibrary();
  const lyricsHistory = useLyricsHistory(song.lyrics);

  // Reset history when song changes
  useEffect(() => {
    lyricsHistory.resetHistory(song.lyrics);
  }, [song.id]);

  // Find the active line based on current playback time
  const activeLineIndex = useMemo(() => {
    if (!player.isPlaying && player.currentTime === 0) return -1;
    
    let activeIndex = -1;
    for (let i = 0; i < song.lyrics.length; i++) {
      const line = song.lyrics[i];
      if (line.type !== 'prompt' && line.timestamp) {
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
    lyricsHistory.pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  };

  const handleAddPromptLine = () => {
    const newLine: LyricLineType = {
      ...createEmptyLine(),
      type: 'prompt',
    };
    const newLyrics = [...song.lyrics, newLine];
    lyricsHistory.pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  };

  const handleUpdateLine = (index: number, updatedLine: LyricLineType) => {
    const newLyrics = [...song.lyrics];
    newLyrics[index] = updatedLine;
    lyricsHistory.pushState(newLyrics);
    onUpdate({ lyrics: newLyrics });
  };

  const handleDeleteLine = (index: number) => {
    if (song.lyrics.length <= 1) return;
    const newLyrics = song.lyrics.filter((_, i) => i !== index);
    lyricsHistory.pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  };

  const handleMarkTimestamp = (index: number) => {
    const currentTime = player.getCurrentTime();
    const timestamp = formatTime(currentTime);
    const newLyrics = [...song.lyrics];
    newLyrics[index] = { ...newLyrics[index], timestamp };
    lyricsHistory.pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  };

  // Smart timestamp: if a line is focused, add timestamp to it; otherwise create new line
  const handleSmartTimestamp = useCallback(() => {
    const currentTime = player.getCurrentTime();
    const timestamp = formatTime(currentTime);
    
    if (focusedLineIndex !== null && focusedLineIndex < song.lyrics.length) {
      const line = song.lyrics[focusedLineIndex];
      if (line.type !== 'prompt') {
        const newLyrics = [...song.lyrics];
        newLyrics[focusedLineIndex] = { ...newLyrics[focusedLineIndex], timestamp };
        lyricsHistory.pushState(newLyrics, true);
        onUpdate({ lyrics: newLyrics });
      }
    } else {
      const newLine = { ...createEmptyLine(), timestamp };
      const newLyrics = [...song.lyrics, newLine];
      lyricsHistory.pushState(newLyrics, true);
      onUpdate({ lyrics: newLyrics });
    }
  }, [focusedLineIndex, song.lyrics, player, onUpdate, lyricsHistory]);

  // Undo handler
  const handleUndo = useCallback(() => {
    const previousState = lyricsHistory.undo();
    if (previousState) {
      onUpdate({ lyrics: previousState });
    }
  }, [lyricsHistory, onUpdate]);

  // Open prompt library
  const handleOpenPromptLibrary = useCallback(() => {
    setShowPromptLibrary(true);
  }, []);

  // Insert prompt content as prompt lines
  const handleInsertPrompt = useCallback((content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const newPromptLines: LyricLineType[] = lines.map(text => ({
      ...createEmptyLine(),
      type: 'prompt' as const,
      text,
    }));
    const newLyrics = [...song.lyrics, ...newPromptLines];
    lyricsHistory.pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  }, [song.lyrics, onUpdate, lyricsHistory]);

  const handleLoadAudio = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpdate({}, file);
  };

  // Total syllables (only count lyric lines)
  const totalSyllables = song.lyrics
    .filter(line => line.type !== 'prompt')
    .reduce((sum, line) => sum + line.syllableCount, 0);

  const lyricLineCount = song.lyrics.filter(line => line.type !== 'prompt').length;

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
                  line.type !== 'prompt' && activeLineIndex === index && "bg-primary/10"
                )}
              >
                {line.type === 'prompt' ? (
                  <PromptLine
                    line={line}
                    onUpdate={(updated) => handleUpdateLine(index, updated)}
                    onDelete={() => handleDeleteLine(index)}
                    canDelete={song.lyrics.length > 1}
                  />
                ) : (
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
                )}
              </div>
            ))}

            {/* Add line buttons */}
            <div className="flex gap-2 px-3 mt-2">
              <Button
                variant="ghost"
                onClick={handleAddLine}
                className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Línea
              </Button>
              <Button
                variant="ghost"
                onClick={handleAddPromptLine}
                className="flex-1 gap-2 text-accent hover:text-accent/80"
              >
                <FileText className="h-4 w-4" />
                Prompt
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>{lyricLineCount} líneas</span>
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

      {/* Prompt Library Dialog */}
      <PromptLibraryDialog
        open={showPromptLibrary}
        onOpenChange={setShowPromptLibrary}
        prompts={promptLibrary.prompts}
        onAddPrompt={promptLibrary.addPrompt}
        onUpdatePrompt={promptLibrary.updatePrompt}
        onDeletePrompt={promptLibrary.deletePrompt}
        onInsertPrompt={handleInsertPrompt}
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
        onOpenPromptLibrary={handleOpenPromptLibrary}
        onUndo={handleUndo}
        canUndo={lyricsHistory.canUndo}
      />
    </div>
  );
}
