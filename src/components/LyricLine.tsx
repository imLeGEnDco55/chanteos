import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Clock } from 'lucide-react';
import { updateLineText } from '@/hooks/useSongs';
import type { LyricLine as LyricLineType } from '@/types/song';
import { cn } from '@/lib/utils';

interface LyricLineProps {
  line: LyricLineType;
  onUpdate: (line: LyricLineType) => void;
  onDelete: () => void;
  onMarkTimestamp: () => void;
  canDelete: boolean;
}

export function LyricLine({
  line,
  onUpdate,
  onDelete,
  onMarkTimestamp,
  canDelete,
}: LyricLineProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(updateLineText(line, e.target.value));
  };

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...line, timestamp: e.target.value });
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 py-1 px-2 rounded-lg transition-colors",
        isFocused && "bg-accent/50"
      )}
    >
      {/* Timestamp (Ala izquierda) */}
      <div className="flex items-center gap-1 min-w-[60px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMarkTimestamp}
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          title="Marcar tiempo actual"
        >
          <Clock className="h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={line.timestamp}
          onChange={handleTimestampChange}
          placeholder="0:00"
          className="w-[45px] h-7 text-xs text-center p-1 font-mono bg-transparent border-none focus-visible:ring-1"
        />
      </div>

      {/* Texto de la letra (Centro) */}
      <Input
        type="text"
        value={line.text}
        onChange={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Escribe aquí..."
        className="flex-1 text-center h-9 bg-transparent border-none focus-visible:ring-1"
      />

      {/* Contador de sílabas (Ala derecha) */}
      <div className="flex items-center gap-1 min-w-[50px] justify-end">
        <span className={cn(
          "text-sm font-mono w-6 text-center",
          line.syllableCount > 0 ? "text-primary" : "text-muted-foreground"
        )}>
          {line.syllableCount}
        </span>
        
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
