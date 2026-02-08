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
  onFocus?: () => void;
  onBlur?: () => void;
  canDelete: boolean;
  isActive?: boolean;
}

export function LyricLine({
  line,
  onUpdate,
  onDelete,
  onMarkTimestamp,
  onFocus,
  onBlur,
  canDelete,
  isActive = false,
}: LyricLineProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(updateLineText(line, e.target.value));
  };

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...line, timestamp: e.target.value });
  };

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
          onClick={onMarkTimestamp}
          className={cn(
            "h-6 w-6 hover:text-primary",
            isActive ? "text-accent" : "text-muted-foreground"
          )}
          title="Marcar tiempo actual"
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
      <Input
        type="text"
        value={line.text}
        onChange={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Escribe aquí..."
        className={cn(
          "flex-1 text-center h-auto py-1 bg-transparent border-none focus-visible:ring-1",
          isActive && "text-foreground font-medium"
        )}
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
            onClick={onDelete}
            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
