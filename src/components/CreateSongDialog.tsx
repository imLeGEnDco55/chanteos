import { useState, useRef } from 'react';
import { Music, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CreateSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSong: (title: string, audioFile: File | null) => void;
}

export function CreateSongDialog({ open, onOpenChange, onCreateSong }: CreateSongDialogProps) {
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);

    try {
      onCreateSong(title.trim(), audioFile);

      // Reset form
      setTitle('');
      setAudioFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setAudioFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 bg-zinc-900/50 border-b border-white/5">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
            <Music className="h-5 w-5 text-indigo-400" />
            Nueva Canción
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Título del Proyecto
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Inmortal (Versión Demo)"
              className="bg-zinc-900 border-white/5 text-zinc-100 placeholder:text-zinc-700 h-12 focus-visible:ring-indigo-500/50 text-base"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Audio (Opcional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full h-24 flex flex-col gap-2 border-dashed transition-all",
                audioFile
                  ? "bg-indigo-500/5 border-indigo-500/30 text-indigo-300"
                  : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              )}
            >
              {audioFile ? (
                <>
                  <Music className="h-6 w-6" />
                  <span className="text-sm font-medium truncate max-w-[250px]">{audioFile.name}</span>
                  <span className="text-[10px] opacity-70">Haz clic para cambiar archivo</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 opacity-50" />
                  <span className="text-sm font-medium">Arrastra o selecciona un audio</span>
                  <span className="text-[10px] opacity-40">MP3, WAV, M4A o FLAC</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1 h-12 text-zinc-400 hover:text-white hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="flex-1 h-12 bg-white text-black hover:bg-zinc-200 font-bold shadow-lg shadow-white/5 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Creando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Crear Proyecto</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
