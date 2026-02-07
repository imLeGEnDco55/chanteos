import { Plus, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LyricLine } from './LyricLine';
import { AudioPlayer } from './AudioPlayer';
import { ThemeToggle } from './ThemeToggle';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { createEmptyLine } from '@/hooks/useSongs';
import { formatTime } from '@/lib/syllables';
import type { Song, LyricLine as LyricLineType } from '@/types/song';
import { useRef, useState } from 'react';

interface SongEditorProps {
  song: Song;
  onBack: () => void;
  onUpdate: (updates: Partial<Song>, audioFile?: File) => void;
}

export function SongEditor({ song, onBack, onUpdate }: SongEditorProps) {
  const [showNotes, setShowNotes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const player = useAudioPlayer(song.audioData || null);

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

  const handleLoadAudio = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Pass file to parent to save in IndexedDB
    onUpdate({}, file);
  };

  // Calcular total de sílabas
  const totalSyllables = song.lyrics.reduce((sum, line) => sum + line.syllableCount, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 p-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Input
          type="text"
          value={song.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="flex-1 text-lg font-semibold bg-transparent border-none focus-visible:ring-1"
          placeholder="Título de la canción"
        />

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs"
        >
          {showNotes ? 'Letras' : 'Notas'}
        </Button>

        <ThemeToggle />
      </header>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 text-xs text-muted-foreground">
        <span>{song.lyrics.length} líneas</span>
        <span>{totalSyllables} sílabas</span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 pb-24">
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
          <div className="p-2">
            {/* Column headers */}
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground border-b border-border/50 mb-2">
              <span className="min-w-[60px] text-center">Tiempo</span>
              <span className="flex-1 text-center">Letra</span>
              <span className="min-w-[50px] text-right">Sílab.</span>
            </div>

            {/* Lyrics lines */}
            {song.lyrics.map((line, index) => (
              <LyricLine
                key={line.id}
                line={line}
                onUpdate={(updated) => handleUpdateLine(index, updated)}
                onDelete={() => handleDeleteLine(index)}
                onMarkTimestamp={() => handleMarkTimestamp(index)}
                canDelete={song.lyrics.length > 1}
              />
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
        isLooping={player.isLooping}
        hasAudio={player.hasAudio}
        audioFileName={song.audioFileName}
        onTogglePlay={player.togglePlay}
        onSeek={player.seek}
        onCyclePlaybackRate={player.cyclePlaybackRate}
        onToggleLoop={player.toggleLoop}
        onLoadAudio={handleLoadAudio}
      />
    </div>
  );
}
