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
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
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
  const [songToDelete, setSongToDelete] = useState<string | null>(null);

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

  const handleConfirmDelete = () => {
    if (songToDelete) {
      onDeleteSong(songToDelete);
      setSongToDelete(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="border-b border-border/80 bg-card/95 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Chanteos</h1>
              <p className="text-xs text-muted-foreground">Sonic Workspace</p>
            </div>
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

      <ScrollArea className="min-h-0 flex-1">
        {songs.length === 0 ? (
          <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-card">
              <Music className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Sin canciones aún</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Crea tu primera canción y empieza a escribir
            </p>
            <Button onClick={onCreateSong} className="gap-2 rounded-full px-5">
              <Plus className="h-4 w-4" />
              Nueva canción
            </Button>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {songs
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((song) => (
                <Card
                  key={song.id}
                  className="cursor-pointer border-border/70 bg-card/85 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-md"
                  onClick={() => onSelectSong(song)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{song.title || 'Sin título'}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{song.lyrics.length} líneas</span>
                        {song.audioFileName && (
                          <span className="flex items-center gap-1">
                            <Music className="h-3 w-3" />
                            {song.audioFileName}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(song.updatedAt)}</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setSongToDelete(song.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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

      <DeleteConfirmationDialog
        open={!!songToDelete}
        onOpenChange={(open) => !open && setSongToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
