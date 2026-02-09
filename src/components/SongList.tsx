import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { importProjectFromChnt } from '@/lib/projectFile';
import { Music, Plus, Trash2, MoreVertical, Upload, Mic } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 supports-[backdrop-filter]:bg-zinc-950/60">
        <h1 className="text-xl font-bold tracking-tight text-white">Chanteos</h1>
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".chnt"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            title="Importar"
          >
            <Upload className="h-5 w-5" />
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
            className="ml-2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 pb-20"> {/* pb-20 for safe bottom area on mobile */}
          {songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="h-20 w-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
                <Music className="h-8 w-8 text-zinc-600" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Sin canciones aún</h2>
              <p className="text-zinc-500 max-w-[250px] mx-auto mb-8">
                El silencio es el lienzo. Crea tu primer proyecto para empezar a escribir.
              </p>
              <Button onClick={onCreateSong} className="gap-2 rounded-full px-6 bg-white text-zinc-950 hover:bg-zinc-200">
                <Plus className="h-4 w-4" />
                Crear Proyecto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {songs
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((song) => (
                  <Card
                    key={song.id}
                    className="group relative overflow-hidden bg-zinc-900/50 hover:bg-zinc-900 border-white/5 transition-all duration-200 cursor-pointer active:scale-[0.99]"
                    onClick={() => onSelectSong(song)}
                  >
                    <div className="p-4 flex items-start gap-4">
                      {/* Icon Placeholder */}
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5",
                        song.audioFileName ? "bg-primary/10" : "bg-zinc-800/50"
                      )}>
                        {song.audioFileName ? (
                          <Music className="h-5 w-5 text-primary" />
                        ) : (
                          <Mic className="h-5 w-5 text-zinc-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-white truncate text-base pr-8">
                            {song.title || 'Sin título'}
                          </h3>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mt-1 -mr-2 text-zinc-500 hover:text-white hover:bg-white/5"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSong(song.id);
                                }}
                                className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 ">
                          <span className="text-xs font-medium text-zinc-500">
                            {song.lyrics.filter(l => l.type !== 'prompt').length} líneas
                          </span>
                          <span className="h-1 w-1 rounded-full bg-zinc-700" />
                          <span className="text-xs text-zinc-500">
                            {formatDate(song.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
