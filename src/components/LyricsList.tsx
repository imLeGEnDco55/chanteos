import { memo } from 'react';
import { LyricLine } from './LyricLine';
import { PromptLine } from './PromptLine';
import type { LyricLine as LyricLineType } from '@/types/song';
import { cn } from '@/lib/utils';

interface LyricsListProps {
  lyrics: LyricLineType[];
  activeLineIndex: number;
  focusedLineIndex: number | null;
  onUpdateLine: (index: number, line: LyricLineType) => void;
  onDeleteLine: (index: number) => void;
  onInsertLine: (index: number) => void;
  onFocus: (index: number) => void;
  onBlur: (index: number) => void;
  onWordSelect: (word: string) => void;
}

export const LyricsList = memo(function LyricsList({
  lyrics,
  activeLineIndex,
  focusedLineIndex,
  onUpdateLine,
  onDeleteLine,
  onInsertLine,
  onFocus,
  onBlur,
  onWordSelect,
}: LyricsListProps) {
  return (
    <>
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
              canDelete={lyrics.length > 1}
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
              canDelete={lyrics.length > 1}
              shouldFocus={focusedLineIndex === index}
              isActive={activeLineIndex === index}
            />
          )}
        </div>
      ))}
    </>
  );
});
