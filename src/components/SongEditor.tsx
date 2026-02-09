import { Plus, ChevronLeft, MoreVertical, FileText, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LyricLine } from './LyricLine';
import { PromptLine } from './PromptLine';
import { AudioPlayer } from './AudioPlayer';
import { PromptLibraryDialog } from './PromptLibraryDialog';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useLyricsHistory } from '@/hooks/useLyricsHistory';
import { useRhymeSuggestions } from '@/hooks/useRhymeSuggestions';
import { createEmptyLine } from '@/hooks/useSongs';
import { formatTime, parseTime } from '@/lib/syllables';
import { exportProjectAsChnt, exportLyricsAsTxt } from '@/lib/projectFile';
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
    <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
      {/* Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 p-3 bg-gradient-to-b from-background via-background/80 to-transparent">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-zinc-400 hover:text-white shrink-0">
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
          <Input
            type="text"
            value={song.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="text-lg font-bold bg-transparent border-none focus-visible:ring-0 px-0 text-center h-auto py-0 text-white placeholder:text-zinc-600 truncate w-full"
            placeholder="Título de la canción"
          />
          {song.audioFileName && (
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium tracking-wide bg-zinc-900/50 px-2 py-0.5 rounded-full mt-1 max-w-full truncate">
              <Music className="h-3 w-3 shrink-0" />
              <span className="truncate">{song.audioFileName.replace(/\.[^/.]+$/, '')}</span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white shrink-0">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
            <DropdownMenuItem onClick={() => exportProjectAsChnt(song)} className="cursor-pointer">
              Exportar Proyecto (.CHNT)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportLyricsAsTxt(song)} className="cursor-pointer">
              Exportar Letra (.TXT)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowNotes(!showNotes)} className="cursor-pointer">
              {showNotes ? 'Ver letras' : 'Ver notas'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLoadAudio} className="cursor-pointer">
              Cambiar audio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Content Canvas */}
      <div className="flex-1 overflow-hidden pt-20">
        <ScrollArea className="h-full">
          {showNotes ? (
            <div className="p-4 pb-48">
              <Textarea
                value={song.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="Notas sobre la canción..."
                className="min-h-[500px] resize-none bg-zinc-900/30 border-white/5 text-zinc-300 focus:bg-zinc-900/50 transition-colors p-4 text-base leading-relaxed"
              />
            </div>
          ) : (
            <div className="flex flex-col min-h-full pb-48">
              {/* Lyrics List */}
              <div className="flex-1 px-2 space-y-1">
                {song.lyrics.map((line, index) => (
                  <div
                    key={line.id}
                    className={cn(
                      "transition-all duration-300 rounded-lg",
                      line.type !== 'prompt' && activeLineIndex === index && "bg-white/5 shadow-sm shadow-black/5"
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
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 px-4 mt-8 mb-4">
                <Button
                  variant="outline"
                  onClick={handleAddLine}
                  className="h-12 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 text-primary-foreground/90 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Línea
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddPromptLine}
                  className="h-12 border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/30 text-violet-300 font-medium"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Añadir Prompt
                </Button>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-center gap-6 py-4 opacity-40 hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">{lyricLineCount}</span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">Líneas</span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-white">{totalSyllables}</span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">Sílabas</span>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Inputs hidden */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

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

      {/* Audio Player Fixed Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
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
          canUndo={canUndo}
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
    </div>
  );
}
