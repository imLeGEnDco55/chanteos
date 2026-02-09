import { useState } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { PromptTemplate } from '@/types/song';

interface PromptLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: PromptTemplate[];
  onAddPrompt: (name: string, content: string) => void;
  onUpdatePrompt: (id: string, updates: Partial<PromptTemplate>) => void;
  onDeletePrompt: (id: string) => void;
  onInsertPrompt: (content: string) => void;
  insertOnly?: boolean;
}

export function PromptLibraryDialog({
  open,
  onOpenChange,
  prompts,
  onAddPrompt,
  onUpdatePrompt,
  onDeletePrompt,
  onInsertPrompt,
  insertOnly = false,
}: PromptLibraryDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (newName.trim() && newContent.trim()) {
      onAddPrompt(newName.trim(), newContent.trim());
      setNewName('');
      setNewContent('');
      setIsAdding(false);
    }
  };

  const handleInsert = (prompt: PromptTemplate) => {
    onInsertPrompt(prompt.content);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{insertOnly ? 'Insertar Prompt' : 'Librería de Prompts'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="border border-border rounded-lg p-3 space-y-2"
              >
                {!insertOnly && editingId === prompt.id ? (
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
                      rows={3}
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
                        className={cn(
                          "font-medium",
                          !insertOnly && "cursor-pointer hover:text-primary"
                        )}
                        onClick={() => !insertOnly && setEditingId(prompt.id)}
                      >
                        {prompt.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInsert(prompt)}
                          className="h-8 w-8"
                          title="Insertar en letras"
                        >
                          {copiedId === prompt.id ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        {!insertOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeletePrompt(prompt.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <pre 
                      className={cn(
                        "text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-2 rounded",
                        !insertOnly && "cursor-pointer hover:bg-muted"
                      )}
                      onClick={() => !insertOnly && setEditingId(prompt.id)}
                    >
                      {prompt.content}
                    </pre>
                  </>
                )}
              </div>
            ))}

            {!insertOnly && (
              isAdding ? (
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
                    placeholder="Contenido del prompt..."
                    rows={3}
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
              )
            )}

            {prompts.length === 0 && insertOnly && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay prompts. Créalos desde Ajustes en la pantalla principal.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
