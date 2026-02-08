import { useState } from 'react';
import { Settings, Plus, Trash2, Moon, Sun } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import type { PromptTemplate } from '@/types/song';

interface SettingsDialogProps {
  prompts: PromptTemplate[];
  onAddPrompt: (name: string, content: string) => void;
  onUpdatePrompt: (id: string, updates: Partial<PromptTemplate>) => void;
  onDeletePrompt: (id: string) => void;
}

export function SettingsDialog({
  prompts,
  onAddPrompt,
  onUpdatePrompt,
  onDeletePrompt,
}: SettingsDialogProps) {
  const { isDark, toggleTheme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (newName.trim() && newContent.trim()) {
      onAddPrompt(newName.trim(), newContent.trim());
      setNewName('');
      setNewContent('');
      setIsAdding(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ajustes">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Ajustes</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Theme Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Apariencia
              </h3>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                  <Label htmlFor="dark-mode" className="cursor-pointer">
                    Modo oscuro
                  </Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>

            <Separator />

            {/* Prompt Library Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Librería de Prompts (Suno)
              </h3>
              <p className="text-xs text-muted-foreground">
                Plantillas reutilizables para insertar en tus canciones
              </p>

              <div className="space-y-3">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="border border-border rounded-lg p-3 space-y-2"
                  >
                    {editingId === prompt.id ? (
                      <>
                        <Input
                          value={prompt.name}
                          onChange={(e) => onUpdatePrompt(prompt.id, { name: e.target.value })}
                          placeholder="Nombre del prompt"
                          className="font-medium"
                        />
                        <Textarea
                          value={prompt.content}
                          onChange={(e) => onUpdatePrompt(prompt.id, { content: e.target.value })}
                          placeholder="Contenido..."
                          rows={4}
                        />
                        <Button
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Guardar
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 
                            className="font-medium cursor-pointer hover:text-primary"
                            onClick={() => setEditingId(prompt.id)}
                          >
                            {prompt.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeletePrompt(prompt.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre 
                          className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-2 rounded cursor-pointer hover:bg-muted"
                          onClick={() => setEditingId(prompt.id)}
                        >
                          {prompt.content}
                        </pre>
                      </>
                    )}
                  </div>
                ))}

                {isAdding ? (
                  <div className="border border-dashed border-primary rounded-lg p-3 space-y-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nombre del prompt"
                      autoFocus
                    />
                    <Textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Contenido del prompt (ej: [Verse], [Chorus]...)"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAdd}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setIsAdding(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo prompt
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
