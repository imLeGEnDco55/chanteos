import { useState, useRef } from 'react';
import { Music, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Nueva Canción
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mi nueva canción"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-input">Audio (opcional)</Label>
            <input
              id="audio-input"
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {audioFile ? (
               <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
                 <Music className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                 <span className="flex-1 truncate">{audioFile.name}</span>
                 <Button
                   type="button"
                   variant="ghost"
                   size="icon"
                   className="h-6 w-6 -mr-1"
                   onClick={handleClearFile}
                   aria-label="Quitar archivo"
                 >
                   <X className="h-4 w-4" />
                 </Button>
               </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                Seleccionar archivo de audio
              </Button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
