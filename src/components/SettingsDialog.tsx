import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Moon, Sun, Key, Download, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import type { PromptTemplate } from '@/types/song';
import { toast } from 'sonner';

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
  const { apiKey: storedKey, model: storedModel, saveSettings } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Local state for editing
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (open) {
      setApiKey(storedKey);
      setModel(storedModel);
    }
  }, [open, storedKey, storedModel]);

  const handleSaveSettings = () => {
    saveSettings(apiKey, model);
    toast.success('Ajustes guardados correctamente');
  };

  const handleExportPrompts = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'prompt-library.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleAdd = () => {
    if (newName.trim() && newContent.trim()) {
      onAddPrompt(newName.trim(), newContent.trim());
      setNewName('');
      setNewContent('');
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ajustes" className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] bg-zinc-950 border-white/10 text-zinc-100 p-0 overflow-hidden shadow-2xl shadow-black/50">
        <DialogHeader className="p-6 bg-zinc-900/50 border-b border-white/5">
          <DialogTitle className="text-xl font-bold text-white tracking-tight">Ajustes</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Configura tu espacio creativo y motores de IA.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-8">
            {/* Theme Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Apariencia
              </h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    {isDark ? (
                      <Moon className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <Sun className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-zinc-100 font-medium cursor-pointer">
                      Modo Oscuro
                    </Label>
                    <p className="text-xs text-zinc-500">Recomendado para sesiones nocturnas.</p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-indigo-500"
                />
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* AI Configuration Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Key className="h-3 w-3" /> Inteligencia Artificial
              </h3>
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <div className="bg-zinc-900/50 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="text-zinc-300 text-sm">
                      Google Gemini API Key
                    </Label>
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Pegar API Key aquí..."
                        className="bg-zinc-950 border-white/10 text-zinc-200 placeholder:text-zinc-700 pr-10 focus-visible:ring-indigo-500/50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <Key className="h-4 w-4 text-indigo-400" /> : <Key className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-sm">Modelo de Generación</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-zinc-950 border-white/10 text-zinc-200 focus:ring-indigo-500/50">
                        <SelectValue placeholder="Selecciona un modelo" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                        <SelectItem value="gemini-2.0-flash">
                          <span className="flex items-center gap-2">⚡ Gemini 2.0 Flash <span className="text-xs text-zinc-500 ml-auto">Recomendado</span></span>
                        </SelectItem>
                        <SelectItem value="gemini-2.5-flash-lite">
                          <span className="flex items-center gap-2">🚀 Gemini 2.5 Lite <span className="text-xs text-zinc-500 ml-auto">Rápido</span></span>
                        </SelectItem>
                        <SelectItem value="gemini-3-flash-preview">
                          <span className="flex items-center gap-2">🧪 Gemini 3 Preview <span className="text-xs text-zinc-500 ml-auto">Nuevo</span></span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-zinc-900/80 p-3 border-t border-white/5 flex justify-end">
                  <Button onClick={handleSaveSettings} size="sm" className="bg-white text-black hover:bg-zinc-200 font-medium">
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Prompt Library Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Download className="h-3 w-3" /> Librería de Prompts
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPrompts}
                  className="h-7 text-xs border-white/10 bg-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Exportar JSON
                </Button>
              </div>

              <div className="space-y-2">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="group flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/60 hover:border-white/10 transition-all"
                  >
                    {editingId === prompt.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={prompt.name}
                          onChange={(e) => onUpdatePrompt(prompt.id, { name: e.target.value })}
                          className="bg-zinc-950 border-white/10 h-8 text-sm"
                          autoFocus
                        />
                        <Textarea
                          value={prompt.content}
                          onChange={(e) => onUpdatePrompt(prompt.id, { content: e.target.value })}
                          className="bg-zinc-950 border-white/10 text-sm min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs hover:bg-white/5 text-zinc-400">Cancelar</Button>
                          <Button size="sm" onClick={() => setEditingId(null)} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">Guardar</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setEditingId(prompt.id)}
                        >
                          <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                            {prompt.name}
                          </h4>
                          <p className="text-xs text-zinc-500 truncate font-mono mt-0.5 opacity-70">
                            {prompt.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeletePrompt(prompt.id)}
                            className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {isAdding ? (
                  <div className="p-3 rounded-lg border border-dashed border-indigo-500/30 bg-indigo-500/5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
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
                      <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-7 text-xs hover:bg-white/5">Cancelar</Button>
                      <Button size="sm" onClick={handleAdd} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">Añadir</Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-10 border-dashed border-white/10 bg-transparent text-zinc-500 hover:text-white hover:bg-white/5 hover:border-white/20"
                    onClick={() => setIsAdding(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Prompt
                  </Button>
                )}
              </div>
            </div>

            {/* Footer Credits */}
            <div className="pt-6 border-t border-white/5">
              <div className="text-center space-y-2">
                <p className="text-[10px] text-zinc-600 font-mono tracking-tight uppercase">
                  Sonic Obsidian Design System
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
                  <span>v1.2.0</span>
                  <span className="h-3 w-px bg-white/10" />
                  <span>Chanteos</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
