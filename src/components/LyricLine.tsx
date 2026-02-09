import { useState, useRef, useCallback, memo } from 'react';
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
}: LyricLineProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.(index);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.(index);
  };

  // Handle Enter (or Shift+Enter) for new line insertion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onInsertLine?.(index);
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
        "flex items-center gap-1 py-1 px-1 transition-colors", // Reduced padding/gap
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
          "flex-1 text-center py-0 px-1 bg-transparent border-none focus-visible:ring-0 focus:bg-background/20 rounded-sm resize-none overflow-hidden outline-none",
          isActive && "text-foreground font-medium"
        )}
      />

      {/* Contador de sílabas (Ala derecha) */}
      <div className="flex items-center justify-end min-w-[24px] pr-1">
        <span
          onClick={() => canDelete && onDelete(index)}
          className={cn(
            "text-[10px] font-mono leading-none select-none transition-colors",
            isActive ? "text-accent font-medium" : line.syllableCount > 0 ? "text-primary" : "text-muted-foreground opacity-50",
            canDelete && "cursor-pointer hover:text-destructive hover:opacity-100 hover:scale-110 transform duration-75"
          )}
          title={canDelete ? "Borrar línea" : undefined}
        >
          {line.syllableCount}
        </span>
      </div>

    </div>
  );
});
