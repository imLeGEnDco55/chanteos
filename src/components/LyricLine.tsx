import { useState, useRef, useCallback, memo, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        onInsertLine?.(index);
      }
    }
  };

  const handleSelect = useCallback(() => {
    if (!inputRef.current || !onWordSelect) return;

    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;

    if (start !== end) {
      const selectedText = line.text.substring(start, end).trim();
      if (selectedText && selectedText.length > 0) {
        onWordSelect(selectedText);
      }
    } else {
      const text = line.text;
      let wordStart = start;
      let wordEnd = start;

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

  const handleDoubleClick = useCallback(() => {
    setTimeout(() => {
      handleSelect();
    }, 10);
  }, [handleSelect]);

  return (
    <div
      className={cn(
        "flex items-center gap-1 py-1.5 px-2 transition-all duration-300 rounded-lg group",
        isFocused && "bg-zinc-900 shadow-sm shadow-black/20 scale-[1.01] z-10",
        isActive && !isFocused && "bg-indigo-500/5 ring-1 ring-white/5"
      )}
    >
      {/* Timestamp */}
      <div className="flex items-center justify-start min-w-[40px]">
        <span className={cn(
          "text-[9px] font-mono select-none tracking-tighter transition-opacity duration-300",
          isActive ? "text-indigo-400 font-bold opacity-100" : "text-zinc-600 opacity-40 group-hover:opacity-100"
        )}>
          {line.timestamp || '00:00'}
        </span>
      </div>

      {/* Lyric Text */}
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
          "flex-1 text-center py-1 px-2 bg-transparent border-none focus-visible:ring-0 rounded-md resize-none overflow-hidden outline-none transition-all text-base leading-relaxed",
          isActive ? "text-white font-medium" : "text-zinc-400 font-normal group-hover:text-zinc-200",
          isFocused && "text-white"
        )}
      />

      {/* Syllable Count / Delete Action */}
      <div className="flex items-center justify-end min-w-[32px]">
        <button
          type="button"
          onClick={() => canDelete && onDelete(index)}
          className={cn(
            "text-[10px] font-mono select-none transition-all duration-200 h-6 w-6 flex items-center justify-center rounded-full",
            isActive ? "text-indigo-400 bg-indigo-500/10 font-bold" : "text-zinc-600 bg-zinc-900/50",
            canDelete && "cursor-pointer hover:bg-red-500 hover:text-white"
          )}
          title={canDelete ? "Click para borrar línea (o mantén rimas)" : undefined}
        >
          {line.syllableCount}
        </button>
      </div>
    </div>
  );
});
