import { useState, memo } from 'react';
import { Input } from '@/components/ui/input';
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
}

export const PromptLine = memo(function PromptLine({
  index,
  line,
  onUpdate,
  onDelete,
  canDelete,
}: PromptLineProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, { ...line, text: e.target.value });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 px-3 transition-colors bg-accent/20 border-l-2 border-accent",
        isFocused && "bg-accent/40"
      )}
    >
      {/* Prompt icon indicator */}
      <div className="flex items-center justify-center min-w-[60px]">
        <FileText className="h-4 w-4 text-accent" />
      </div>

      {/* Prompt text (full width, no syllable count) */}
      <Input
        type="text"
        value={line.text}
        onChange={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="[Verse], [Chorus], instrucciones..."
        aria-label="Contenido del prompt"
        className={cn(
          "flex-1 h-auto py-1 bg-transparent border-none focus-visible:ring-1 italic text-accent text-center"
        )}
      />

      {/* Delete button only */}
      <div className="flex items-center gap-1 min-w-[40px] justify-end">
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="Eliminar prompt"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});
