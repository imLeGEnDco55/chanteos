import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { importProjectFromChnt } from '@/lib/projectFile';
import { Music, Plus, Trash2, MoreVertical, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsDialog } from './SettingsDialog';
import type { Song, PromptTemplate } from '@/types/song';

interface SongListProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onCreateSong: () => void;
  onDeleteSong: (songId: string) => void;
  onImportSong: (song: Song) => void;
  prompts: PromptTemplate[];
  onAddPrompt: (name: string, content: string) => void;
  onUpdatePrompt: (id: string, updates: Partial<PromptTemplate>) => void;
  onDeletePrompt: (id: string) => void;
}

export function SongList({
  songs,
  onSelectSong,
  onCreateSong,
  onDeleteSong,
  onImportSong,
  prompts,
  onAddPrompt,
  onUpdatePrompt,
  onDeletePrompt,
}: SongListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedSong = await importProjectFromChnt(file);
      onImportSong(importedSong);
      toast.success('Proyecto importado correctamente');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Error al importar el archivo .CHNT');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Chanteos</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".chnt"
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              title="Importar Proyecto (.CHNT)"
              aria-label="Importar proyecto"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <SettingsDialog
              prompts={prompts}
              onAddPrompt={onAddPrompt}
              onUpdatePrompt={onUpdatePrompt}
              onDeletePrompt={onDeletePrompt}
            />
            <Button
              onClick={onCreateSong}
              size="icon"
              className="rounded-full"
              aria-label="Crear nueva canción"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Song list */}
      <ScrollArea className="flex-1">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
            <Music className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Sin canciones aún</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Crea tu primera canción y empieza a escribir
            </p>
            <Button onClick={onCreateSong} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva canción
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {songs
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((song) => (
                <Card
                  key={song.id}
                  className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onSelectSong(song)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{song.title || 'Sin título'}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{song.lyrics.length} líneas</span>
                        {song.audioFileName && (
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            {song.audioFileName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(song.updatedAt)}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Opciones de canción"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSong(song.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
