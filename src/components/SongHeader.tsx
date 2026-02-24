import { memo } from 'react';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SongHeaderProps {
  title: string;
  audioFileName?: string;
  showNotes: boolean;
  onBack: () => void;
  onUpdateTitle: (title: string) => void;
  onToggleNotes: () => void;
  onLoadAudio: () => void;
  onExportProject: () => void;
  onExportLyrics: () => void;
}

export const SongHeader = memo(function SongHeader({
  title,
  audioFileName,
  showNotes,
  onBack,
  onUpdateTitle,
  onToggleNotes,
  onLoadAudio,
  onExportProject,
  onExportLyrics,
}: SongHeaderProps) {
  return (
    <header className="flex items-center gap-2 border-b border-border/80 bg-card/95 p-3 backdrop-blur">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1 min-w-0 flex flex-col items-center">
        <Input
          type="text"
          value={title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="border-none bg-transparent px-0 text-center text-lg font-bold focus-visible:ring-1"
          placeholder="Título de la canción"
        />
        {audioFileName && (
          <p className="text-xs text-accent font-medium uppercase tracking-wide truncate text-center">
            {audioFileName.replace(/\.[^/.]+$/, "")}
          </p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExportProject}>
            Exportar Proyecto (.CHNT)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportLyrics}>
            Exportar Letra (.TXT)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleNotes}>
            {showNotes ? "Ver letras" : "Ver notas"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLoadAudio}>
            Cambiar audio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
});
