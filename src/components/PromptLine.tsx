import { useState, memo, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
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
        e.preventDefault();
        onInsertLine?.(index);
      }
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 py-1.5 px-2 transition-all duration-300 rounded-lg group mt-6 mb-2",
        "bg-violet-500/5 border-l-2 border-violet-500/30",
        isFocused && "bg-violet-500/10 border-violet-500 scale-[1.01] z-10 shadow-lg shadow-violet-900/10"
      )}
    >
      {/* Icon Indicator */}
      <div className="flex items-center justify-start min-w-[40px]">
        <FileText className={cn(
          "h-4 w-4 transition-colors duration-300",
          isFocused ? "text-violet-400" : "text-violet-500/40 group-hover:text-violet-400"
        )} />
      </div>

      {/* Prompt Text */}
      <TextareaAutosize
        ref={inputRef}
        value={line.text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="[Verse], [Chorus], [Intro]..."
        minRows={1}
        className={cn(
          "flex-1 py-1 px-2 bg-transparent border-none focus-visible:ring-0 rounded-md italic text-center placeholder:text-violet-500/20 resize-none overflow-hidden outline-none transition-all",
          "text-violet-300 font-medium text-sm tracking-wide uppercase",
          isFocused && "text-violet-200"
        )}
      />

      {/* Delete Action */}
      <div className="flex items-center justify-end min-w-[32px]">
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="flex items-center justify-center h-6 w-6 rounded-full text-violet-500/30 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
            title="Borrar bloque estructural"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
