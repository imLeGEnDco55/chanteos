import { useState, useRef, useCallback, memo, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { updateLineText } from '@/hooks/useSongs';
import type { LyricLine as LyricLineType } from '@/types/song';
import { cn } from '@/lib/utils';

interface LyricLineProps {
  index: number;
  line: LyricLineType;
  onUpdate: (index: number, line: LyricLineType) => void;
  onDelete: (index: number) => void;
  onInsertLine?: (index: number) => void;
  onFocus?: (index: number) => void;
  onBlur?: (index: number) => void;
  onWordSelect?: (word: string) => void;
  canDelete: boolean;
  isActive?: boolean;
  shouldFocus?: boolean;
}

export const LyricLine = memo(function LyricLine({
  index,
  line,
  onUpdate,
  onDelete,
  onInsertLine,
  onFocus,
  onBlur,
  onWordSelect,
  canDelete,
  isActive = false,
  shouldFocus = false,
}: LyricLineProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus effect
  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
      // Ensure cursor is at the end if there's text (though usually empty on new line)
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [shouldFocus]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.(index);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.(index);
  };

  // Handle Enter (New Block) vs Shift+Enter (Newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        // Enter WITHOUT Shift -> New Block
        e.preventDefault();
        onInsertLine?.(index);
      }
      // Enter WITH Shift -> Default behavior (Newline in Textarea)
    }
  };

  // Detect text selection and extract the selected word
  const handleSelect = useCallback(() => {
    if (!inputRef.current || !onWordSelect) return;

    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;

    if (start !== end) {
      // There's a selection - extract the selected text
      const selectedText = line.text.substring(start, end).trim();
      if (selectedText && selectedText.length > 0) {
        onWordSelect(selectedText);
      }
    } else {
      // No selection - try to get the word at cursor position
      const text = line.text;
      let wordStart = start;
      let wordEnd = start;

      // Find word boundaries
      while (wordStart > 0 && /[\wáéíóúüñ]/i.test(text[wordStart - 1])) {
        wordStart--;
      }
      while (wordEnd < text.length && /[\wáéíóúüñ]/i.test(text[wordEnd])) {
        wordEnd++;
      }

      if (wordEnd > wordStart) {
        const word = text.substring(wordStart, wordEnd).trim();
        if (word.length > 0) {
          onWordSelect(word);
        }
      }
    }
  }, [line.text, onWordSelect]);

  // Handle double-click to select word
  const handleDoubleClick = useCallback(() => {
    // Small delay to let the browser select the word first
    setTimeout(() => {
      handleSelect();
    }, 10);
  }, [handleSelect]);

  return (
    <div
      className={cn(
        "flex min-h-8 items-center gap-1 px-1 py-1 transition-colors",
        isFocused && "bg-accent/30",
        isActive && !isFocused && "bg-primary/10"
      )}
    >
      {/* Timestamp (Ala izquierda) */}
      <div className="flex items-center justify-start min-w-[32px] pl-1">
        <span className={cn(
          "text-[10px] font-mono leading-none select-none",
          isActive ? "text-accent font-medium" : "text-muted-foreground opacity-70"
        )}>
          {line.timestamp || '00:00'}
        </span>
      </div>

      {/* Texto de la letra (Centro) */}
      <TextareaAutosize
        ref={inputRef}
        value={line.text}
        onChange={(e) => onUpdate(index, updateLineText(line, e.target.value))}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onDoubleClick={handleDoubleClick}
        placeholder="Escribe aquí..."
        minRows={1}
        className={cn(
          "min-h-6 flex-1 resize-none overflow-hidden rounded-sm border-none bg-transparent px-1 py-0 text-center text-base leading-6 outline-none focus:bg-background/20 focus-visible:ring-0",
          isActive && "text-foreground font-medium"
        )}
      />

      {/* Contador de sílabas (Ala derecha) */}
      <div className="flex items-center justify-end min-w-[24px] pr-1">
        <button
          onClick={() => canDelete && onDelete(index)}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md border-none bg-transparent p-0 text-[10px] font-mono leading-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isActive ? "text-accent font-medium" : line.syllableCount > 0 ? "text-primary" : "text-muted-foreground opacity-50",
            canDelete && "cursor-pointer hover:text-destructive hover:scale-110"
          )}
          aria-label={canDelete ? `Borrar línea ${index + 1}` : undefined}
          title={canDelete ? "Borrar línea" : undefined}
        >
          {line.syllableCount}
        </button>
      </div>

    </div>
  );
});
