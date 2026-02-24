import { memo } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SongControlsProps {
  onAddLine: () => void;
  onAddPromptLine: () => void;
  lineCount: number;
  syllableCount: number;
}

export const SongControls = memo(function SongControls({
  onAddLine,
  onAddPromptLine,
  lineCount,
  syllableCount,
}: SongControlsProps) {
  return (
    <>
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

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>{lineCount} líneas</span>
        <span>•</span>
        <span>{syllableCount} sílabas</span>
      </div>
    </>
  );
});
