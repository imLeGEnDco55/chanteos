import { useState } from 'react';
import { Plus, Trash2, Copy, Check, Search, Download } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrompts = prompts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    // Beep/feedback visual could go here
    setTimeout(() => {
      setCopiedId(null);
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] bg-zinc-950 border-white/10 text-zinc-100 p-0 overflow-hidden shadow-2xl shadow-black/50">
        <DialogHeader className="p-4 bg-zinc-900/50 border-b border-white/5 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Download className="h-4 w-4 text-indigo-400" />
            {insertOnly ? 'Insertar Prompt' : 'Librería de Prompts'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-white/5 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-indigo-500/50"
            />
          </div>
        </div>

        <ScrollArea className="max-h-[50vh] p-4">
          <div className="space-y-3">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className={cn(
                  "group border border-white/5 rounded-xl p-3 space-y-2 transition-all duration-200",
                  editingId === prompt.id ? "bg-zinc-900/80 border-indigo-500/30" : "bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-white/10"
                )}
              >
                {!insertOnly && editingId === prompt.id ? (
                  <div className="space-y-3 animate-in fade-in zoom-in-95">
                    <Input
                      value={prompt.name}
                      onChange={(e) => onUpdatePrompt(prompt.id, { name: e.target.value })}
                      placeholder="Nombre del prompt"
                      className="bg-zinc-950 border-white/10 font-medium h-9"
                    />
                    <Textarea
                      value={prompt.content}
                      onChange={(e) => onUpdatePrompt(prompt.id, { content: e.target.value })}
                      placeholder="Contenido..."
                      rows={3}
                      className="bg-zinc-950 border-white/10 text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-xs hover:bg-white/5 text-zinc-400">Cancelar</Button>
                      <Button size="sm" onClick={() => setEditingId(null)} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">Guardar</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h4
                        className={cn(
                          "font-medium text-zinc-200 truncate pr-2",
                          !insertOnly && "cursor-pointer group-hover:text-indigo-300 transition-colors"
                        )}
                        onClick={() => !insertOnly && setEditingId(prompt.id)}
                      >
                        {prompt.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleInsert(prompt)}
                          className={cn(
                            "h-8 px-3 text-xs font-medium transition-all duration-300",
                            copiedId === prompt.id
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/20"
                          )}
                        >
                          {copiedId === prompt.id ? (
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          {copiedId === prompt.id ? 'Insertado' : 'Usar'}
                        </Button>

                        {!insertOnly && (
                          <div className="w-px h-4 bg-white/10 mx-1" />
                        )}

                        {!insertOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeletePrompt(prompt.id)}
                            className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "relative",
                        !insertOnly && "cursor-pointer"
                      )}
                      onClick={() => !insertOnly && setEditingId(prompt.id)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900/10 pointer-events-none rounded" />
                      <pre className="text-xs text-zinc-500 whitespace-pre-wrap font-mono bg-black/20 p-2.5 rounded-lg border border-white/5 overflow-hidden max-h-[80px]">
                        {prompt.content}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            ))}

            {!insertOnly && (
              isAdding ? (
                <div className="p-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 space-y-3 animate-in fade-in zoom-in-95 duration-200 mt-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre del Prompt (ej: Estructura Pop)"
                    className="bg-zinc-950 border-indigo-500/20 text-sm"
                    autoFocus
                  />
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Contenido..."
                    className="bg-zinc-950 border-indigo-500/20 text-sm min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 text-xs hover:bg-white/5">Cancelar</Button>
                    <Button size="sm" onClick={handleAdd} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">Añadir Prompt</Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-12 mt-2 border-dashed border-white/10 bg-transparent text-zinc-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all font-normal"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo Template
                </Button>
              )
            )}

            {filteredPrompts.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto border border-white/5">
                  <Search className="h-5 w-5 text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-500">
                  {searchTerm ? 'No se encontraron prompts que coincidan' : 'No hay prompts guardados'}
                </p>
                {insertOnly && !searchTerm && (
                  <p className="text-xs text-zinc-600">
                    Crea prompts desde la configuración principal para usarlos aquí.
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
