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
        "flex items-center gap-2 py-1 px-3 transition-colors bg-accent/20 border-l-2 border-accent",
        isFocused && "bg-accent/40"
      )}
    >
      {/* Prompt icon indicator (Ala izquierda) */}
      <div className="flex items-center justify-start min-w-[32px] pl-1">
        <FileText className="h-3 w-3 text-accent/70" />
      </div>

      {/* Prompt text (full width, no syllable count) */}
      <Input
        type="text"
        value={line.text}
        onChange={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="[Verse], [Chorus]..."
        className={cn(
          "flex-1 h-auto py-0 px-1 bg-transparent border-none focus-visible:ring-0 focus:bg-background/20 rounded-sm italic text-accent text-center placeholder:text-accent/30"
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
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});
