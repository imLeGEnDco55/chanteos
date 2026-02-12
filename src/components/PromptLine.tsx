import { useState, memo, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Trash2, FileText } from 'lucide-react';
import type { LyricLine as LyricLineType } from '@/types/song';
import { cn } from '@/lib/utils';

interface PromptLineProps {
  index: number;
  line: LyricLineType;
  onUpdate: (index: number, line: LyricLineType) => void;
  onDelete: (index: number) => void;
  canDelete: boolean;
  onInsertLine?: (index: number) => void;
  shouldFocus?: boolean;
}

export const PromptLine = memo(function PromptLine({
  index,
  line,
  onUpdate,
  onDelete,
  canDelete,
  onInsertLine,
  shouldFocus = false,
}: PromptLineProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus effect
  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
      // Ensure cursor is at the end if there's text
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [shouldFocus]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(index, { ...line, text: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        // Enter WITHOUT Shift -> New Block
        e.preventDefault();
        onInsertLine?.(index);
      }
      // Enter WITH Shift -> Default behavior (Newline)
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-8 items-center gap-1 border-l-2 border-accent bg-accent/20 px-1 py-1 transition-colors",
        isFocused && "bg-accent/40"
      )}
    >
      {/* Prompt icon indicator (Ala izquierda) */}
      <div className="flex items-center justify-start min-w-[32px] pl-1">
        <FileText className="h-3 w-3 text-accent/70" />
      </div>

      {/* Prompt text (full width, no syllable count) */}
      <TextareaAutosize
        ref={inputRef}
        value={line.text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="[Verse], [Chorus]..."
        minRows={1}
        className={cn(
          "h-auto min-h-6 flex-1 resize-none overflow-hidden rounded-sm border-none bg-transparent px-1 py-0 text-center text-base italic leading-6 text-accent outline-none placeholder:text-accent/30 focus:bg-background/20 focus-visible:ring-0"
        )}
      />

      {/* Delete button (Ala derecha) */}
      <div className="flex items-center justify-end min-w-[24px] pr-1">
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-transparent"
            title="Borrar prompt"
            aria-label="Borrar línea de prompt"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});
