import { Plus, ChevronLeft, MoreVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LyricLine } from './LyricLine';
import { PromptLine } from './PromptLine';
import { AudioPlayer } from './AudioPlayer';
import { PromptLibraryDialog } from './PromptLibraryDialog';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useRecorder } from '@/hooks/useRecorder';
import { useVoiceMixer } from '@/hooks/useVoiceMixer';
import { useLyricsHistory } from '@/hooks/useLyricsHistory';
import { useRhymeSuggestions } from '@/hooks/useRhymeSuggestions';
import { createEmptyLine } from '@/hooks/useSongs';
import { formatTime, parseTime } from '@/lib/syllables';
import { exportProjectAsChnt, exportLyricsAsTxt } from '@/lib/projectFile';
import { toast } from 'sonner';
import type { Song, LyricLine as LyricLineType, PromptTemplate } from '@/types/song';
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
  prompts: PromptTemplate[];
}

export function SongEditor({ song, onBack, onUpdate, prompts }: SongEditorProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showRhymePanel, setShowRhymePanel] = useState(false);
  const [focusedLineIndex, setFocusedLineIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lyricsRef = useRef(song.lyrics);

  useEffect(() => {
    lyricsRef.current = song.lyrics;
  }, [song.lyrics]);

  const player = useAudioPlayer(song.audioData || null);
  const { getCurrentTime } = player;

  const recorder = useRecorder();
  const mixer = useVoiceMixer(player.audioElement, recorder.voiceBuffers);

  const { pushState, undo, resetHistory, canUndo } = useLyricsHistory(song.lyrics);

  const rhymeSuggestions = useRhymeSuggestions();
  const { fetchSuggestions } = rhymeSuggestions;

  // Reset history when song changes
  useEffect(() => {
    resetHistory(song.lyrics);
  }, [song.id, resetHistory]);

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

  const handleAddLine = useCallback(() => {
    const currentLyrics = lyricsRef.current;
    const newLyrics = [...currentLyrics, createEmptyLine()];
    pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  }, [pushState, onUpdate]);

  const handleAddPromptLine = useCallback(() => {
    const currentLyrics = lyricsRef.current;
    const newLine: LyricLineType = {
      ...createEmptyLine(),
      type: 'prompt',
    };
    const newLyrics = [...currentLyrics, newLine];
    pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  }, [pushState, onUpdate]);

  const handleUpdateLine = useCallback((index: number, updatedLine: LyricLineType) => {
    const currentLyrics = lyricsRef.current;
    const newLyrics = [...currentLyrics];
    newLyrics[index] = updatedLine;
    pushState(newLyrics);
    onUpdate({ lyrics: newLyrics });
  }, [pushState, onUpdate]);

  const handleInsertLine = useCallback((index: number) => {
    const currentLyrics = lyricsRef.current;
    const newLine = createEmptyLine();
    const newLyrics = [...currentLyrics];
    newLyrics.splice(index + 1, 0, newLine);

    pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });

    // Focus the new line (next index)
    // We set a small timeout to allow the new component to mount
    setTimeout(() => {
      setFocusedLineIndex(index + 1);
    }, 0);
  }, [pushState, onUpdate]);

  const handleDeleteLine = useCallback((index: number) => {
    const currentLyrics = lyricsRef.current;
    if (currentLyrics.length <= 1) return;
    const newLyrics = currentLyrics.filter((_, i) => i !== index);
    pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  }, [pushState, onUpdate]);

  const handleMarkTimestamp = useCallback((index: number) => {
    const currentLyrics = lyricsRef.current;
    const currentTime = getCurrentTime();
    const timestamp = formatTime(currentTime);
    const newLyrics = [...currentLyrics];
    newLyrics[index] = { ...newLyrics[index], timestamp };
    pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  }, [getCurrentTime, pushState, onUpdate]);

  const handleFocus = useCallback((index: number) => {
    setFocusedLineIndex(index);
  }, []);

  const handleBlur = useCallback((index: number) => {
    setFocusedLineIndex(null);
  }, []);

  // Smart timestamp: if a line is focused, add timestamp to it; otherwise create new line
  const handleSmartTimestamp = useCallback(() => {
    const currentLyrics = lyricsRef.current;
    const currentTime = getCurrentTime();
    const timestamp = formatTime(currentTime);

    if (focusedLineIndex !== null && focusedLineIndex < currentLyrics.length) {
      const line = currentLyrics[focusedLineIndex];
      if (line.type !== 'prompt') {
        const newLyrics = [...currentLyrics];
        newLyrics[focusedLineIndex] = { ...newLyrics[focusedLineIndex], timestamp };
        pushState(newLyrics, true);
        onUpdate({ lyrics: newLyrics });
      }
    } else {
      const newLine = { ...createEmptyLine(), timestamp };
      const newLyrics = [...currentLyrics, newLine];
      pushState(newLyrics, true);
      onUpdate({ lyrics: newLyrics });
    }
  }, [focusedLineIndex, getCurrentTime, onUpdate, pushState]);

  // Undo handler
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      onUpdate({ lyrics: previousState });
    }
  }, [undo, onUpdate]);

  // Open prompt library
  const handleOpenPromptLibrary = useCallback(() => {
    setShowPromptLibrary(true);
  }, []);

  // Insert prompt content as prompt lines
  const handleInsertPrompt = useCallback((content: string) => {
    const currentLyrics = lyricsRef.current;
    const lines = content.split('\n').filter(line => line.trim());
    const newPromptLines: LyricLineType[] = lines.map(text => ({
      ...createEmptyLine(),
      type: 'prompt' as const,
      text,
    }));
    const newLyrics = [...currentLyrics, ...newPromptLines];
    pushState(newLyrics, true);
    onUpdate({ lyrics: newLyrics });
  }, [onUpdate, pushState]);

  const handleLoadAudio = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpdate({}, file);
  };

  // Handle word selection for rhyme suggestions
  const handleWordSelect = useCallback((word: string) => {
    fetchSuggestions(word);
    setShowRhymePanel(true);
  }, [fetchSuggestions]);

  // Handle clicking a rhyme word to insert it
  const handleRhymeWordClick = useCallback((word: string) => {
    // Fetch new rhymes for the clicked word
    fetchSuggestions(word);
  }, [fetchSuggestions]);

  // Toggle rhyme panel
  const handleToggleRhymePanel = useCallback(() => {
    setShowRhymePanel(prev => !prev);
  }, []);

  // Total syllables (only count lyric lines)
  const totalSyllables = song.lyrics
    .filter(line => line.type !== 'prompt')
    .reduce((sum, line) => sum + line.syllableCount, 0);

  const lyricLineCount = song.lyrics.filter(line => line.type !== 'prompt').length;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-border/80 bg-card/95 p-3 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0 flex flex-col items-center">
          <Input
            type="text"
            value={song.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="border-none bg-transparent px-0 text-center text-lg font-bold focus-visible:ring-1"
            placeholder="Título de la canción"
          />
          {song.audioFileName && (
            <p className="text-xs text-accent font-medium uppercase tracking-wide truncate text-center">
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
            <DropdownMenuItem onClick={() => exportProjectAsChnt(song)}>
              Exportar Proyecto (.CHNT)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportLyricsAsTxt(song)}>
              Exportar Letra (.TXT)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowNotes(!showNotes)}>
              {showNotes ? 'Ver letras' : 'Ver notas'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLoadAudio}>
              Cambiar audio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Content */}
      <ScrollArea className="min-h-0 flex-1">
        {showNotes ? (
          <div className="p-4 pb-40">
            <Textarea
              value={song.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Notas sobre la canción..."
              className="min-h-[200px] resize-none rounded-xl border-border/70 bg-card/70"
            />
          </div>
        ) : (
          <div className="py-2 pb-40">
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
                    index={index}
                    line={line}
                    onUpdate={handleUpdateLine}
                    onDelete={handleDeleteLine}
                    canDelete={song.lyrics.length > 1}
                    onInsertLine={handleInsertLine}
                    shouldFocus={focusedLineIndex === index}
                  />
                ) : (
                  <LyricLine
                    index={index}
                    line={line}
                    onUpdate={handleUpdateLine}
                    onDelete={handleDeleteLine}
                    onInsertLine={handleInsertLine}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onWordSelect={handleWordSelect}
                    canDelete={song.lyrics.length > 1}
                    shouldFocus={focusedLineIndex === index}
                    isActive={activeLineIndex === index}
                  />
                )}
              </div>
            ))}

            {/* Add line buttons */}
            <div className="mt-3 flex gap-2 px-3">
              <Button
                variant="ghost"
                onClick={handleAddLine}
                className="flex-1 gap-2 rounded-lg border border-border/60 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Línea
              </Button>
              <Button
                variant="ghost"
                onClick={handleAddPromptLine}
                className="flex-1 gap-2 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent"
              >
                <FileText className="h-4 w-4" />
                Prompt
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
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

      {/* Prompt Library Dialog (for inserting only) */}
      <PromptLibraryDialog
        open={showPromptLibrary}
        onOpenChange={setShowPromptLibrary}
        prompts={prompts}
        onAddPrompt={() => { }}
        onUpdatePrompt={() => { }}
        onDeletePrompt={() => { }}
        onInsertPrompt={handleInsertPrompt}
        insertOnly
      />

      {/* Audio Player with Rhyme Panel */}
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
        onResetLoop={player.resetLoop}
        onLoadAudio={handleLoadAudio}
        onSkipBack={player.skipBack}
        onSkipForward={player.skipForward}
        onMarkTimestamp={handleSmartTimestamp}
        onOpenPromptLibrary={handleOpenPromptLibrary}
        onUndo={handleUndo}
        canUndo={canUndo}
        isRecording={recorder.isRecording}
        onStartRecording={recorder.startRecording}
        onStopRecording={recorder.stopRecording}
        hasVoices={mixer.hasVoices}
        voiceCount={mixer.voiceCount}
        voicePlaying={mixer.voicePlaying}
        onToggleVoice={mixer.toggleVoice}
        showRhymePanel={showRhymePanel}
        onToggleRhymePanel={handleToggleRhymePanel}
        selectedWord={rhymeSuggestions.selectedWord}
        rhymes={rhymeSuggestions.suggestions?.rhymes || []}
        related={rhymeSuggestions.suggestions?.related || []}
        isLoadingRhymes={rhymeSuggestions.isLoading}
        rhymeError={rhymeSuggestions.error}
        onRhymeWordClick={handleRhymeWordClick}
        onRetryRhymes={rhymeSuggestions.retry}
      />
    </div>
  );
}
