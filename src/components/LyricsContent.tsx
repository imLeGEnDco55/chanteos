import { memo } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LyricLine } from './LyricLine';
import { PromptLine } from './PromptLine';
import { cn } from '@/lib/utils';
import type { LyricLine as LyricLineType } from '@/types/song';

interface LyricsContentProps {
  lyrics: LyricLineType[];
  activeLineIndex: number;
  focusedLineIndex: number | null;
  onUpdateLine: (index: number, line: LyricLineType) => void;
  onDeleteLine: (index: number) => void;
  onInsertLine: (index: number) => void;
  onFocus: (index: number) => void;
  onBlur: (index: number) => void;
  onWordSelect: (word: string) => void;
  onAddLine: () => void;
  onAddPromptLine: () => void;
}

export const LyricsContent = memo(function LyricsContent({
  lyrics,
  activeLineIndex,
  focusedLineIndex,
  onUpdateLine,
  onDeleteLine,
  onInsertLine,
  onFocus,
  onBlur,
  onWordSelect,
  onAddLine,
  onAddPromptLine
}: LyricsContentProps) {
  const totalSyllables = lyrics
    .filter(line => line.type !== 'prompt')
    .reduce((sum, line) => sum + line.syllableCount, 0);

  const lyricLineCount = lyrics.filter(line => line.type !== 'prompt').length;
  const canDelete = lyrics.length > 1;

  return (
    <div className="py-2 pb-40">
      {/* Lyrics lines */}
      {lyrics.map((line, index) => (
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
              onUpdate={onUpdateLine}
              onDelete={onDeleteLine}
              canDelete={canDelete}
              onInsertLine={onInsertLine}
              shouldFocus={focusedLineIndex === index}
            />
          ) : (
            <LyricLine
              index={index}
              line={line}
              onUpdate={onUpdateLine}
              onDelete={onDeleteLine}
              onInsertLine={onInsertLine}
              onFocus={onFocus}
              onBlur={onBlur}
              onWordSelect={onWordSelect}
              canDelete={canDelete}
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
          onClick={onAddLine}
          className="flex-1 gap-2 rounded-lg border border-border/60 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Línea
        </Button>
        <Button
          variant="ghost"
          onClick={onAddPromptLine}
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
  );
});
