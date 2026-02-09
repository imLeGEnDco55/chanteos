import { useState, useRef, useCallback, memo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Clock } from 'lucide-react';
import { updateLineText } from '@/hooks/useSongs';
import type { LyricLine as LyricLineType } from '@/types/song';
import { cn } from '@/lib/utils';

interface LyricLineProps {
  index: number;
  line: LyricLineType;
  onUpdate: (index: number, line: LyricLineType) => void;
  onDelete: (index: number) => void;
  onMarkTimestamp: (index: number) => void;
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
  onMarkTimestamp,
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(index, updateLineText(line, e.target.value));
  };

  // Handle Shift+Enter for line breaks
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow default behavior (line break)
      e.stopPropagation();
    }
  };

  // Detect text selection and extract the selected word
  const handleSelect = useCallback(() => {
    if (!inputRef.current || !onWordSelect) return;

    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;

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
        "flex items-center gap-2 py-2 px-3 transition-colors",
        isFocused && "bg-accent/30",
        isActive && !isFocused && "bg-primary/10"
      )}
    >
      {/* Timestamp (Ala izquierda) */}
      <div className="flex items-center gap-1 min-w-[60px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMarkTimestamp(index)}
          className={cn(
            "h-6 w-6 hover:text-primary",
            isActive ? "text-accent" : "text-muted-foreground"
          )}
          title="Marcar tiempo actual"
          aria-label="Marcar tiempo actual"
        >
          <Clock className="h-3 w-3" />
        </Button>
        <span className={cn(
          "text-xs font-mono min-w-[35px]",
          isActive ? "text-accent font-medium" : "text-muted-foreground"
        )}>
          {line.timestamp || '00:00'}
        </span>
      </div>

      {/* Texto de la letra (Centro) */}
      <Textarea
        ref={inputRef}
        value={line.text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onDoubleClick={handleDoubleClick}
        placeholder="Escribe aquí..."
        aria-label="Texto de la línea"
        className={cn(
          "flex-1 text-center min-h-[2rem] max-h-[10rem] py-1 bg-transparent border-none focus-visible:ring-1 resize-none overflow-y-auto",
          isActive && "text-foreground font-medium"
        )}
        rows={1}
      />

      {/* Contador de sílabas (Ala derecha) */}
      <div className="flex items-center gap-1 min-w-[40px] justify-end">
        <span className={cn(
          "text-sm font-mono",
          isActive ? "text-accent font-medium" : line.syllableCount > 0 ? "text-primary" : "text-muted-foreground"
        )}>
          {line.syllableCount}
        </span>

        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="Eliminar línea"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});
