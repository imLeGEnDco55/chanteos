import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Moon, Sun, Key, Download, Eye, EyeOff } from 'lucide-react';
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
        <Button variant="ghost" size="icon" aria-label="Ajustes">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Ajustes</DialogTitle>
          <DialogDescription>
            Configura tus preferencias y claves API.
          </DialogDescription>
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

            {/* AI Configuration Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Configuración IA (Gemini)
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-primary" />
                  <Label htmlFor="api-key" className="cursor-pointer font-medium">
                    Google Gemini API Key
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    aria-label={showKey ? "Ocultar clave API" : "Mostrar clave API"}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  La clave se guarda localmente en tu navegador. Necesaria para sugerencias de rimas.
                </p>

                {/* MODEL SELECTOR */}
                <div className="space-y-2 pt-2">
                  <Label>Modelo de IA</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-2.0-flash">
                        ⚡ Gemini 2.0 Flash (Rápido/Estable)
                      </SelectItem>
                      <SelectItem value="gemini-2.5-flash-lite">
                        🚀 Gemini 2.5 Flash Lite (Más Rápido/Económico)
                      </SelectItem>
                      <SelectItem value="gemini-3-flash-preview">
                        🧪 Gemini 3 Flash Preview (Experimental)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Usa 2.0 para balance, 2.5 Lite para máxima velocidad, 3 Preview para las últimas capacidades (experimental).
                  </p>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  Guardar Ajustes
                </Button>
              </div>
            </div>

            <Separator />

            {/* Prompt Library Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Librería de Prompts (Suno)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Plantillas reutilizables para insertar en tus canciones
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportPrompts} title="Exportar librería">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>

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
                            aria-label={`Borrar prompt: ${prompt.name}`}
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

            {/* Footer Credits */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="text-center space-y-1.5">
                <p className="text-xs text-muted-foreground font-mono">
                  Desarrollado por: <span className="text-primary">Sonnet 4.5</span>, <span className="text-primary">Opus 4.5</span>, <span className="text-primary">Gemini 3 PRO</span>, <span className="text-primary">Gemini 3 Flash</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Vibecodeado por: <span className="font-semibold text-foreground">@elWaiele</span>
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  2026 | <span className="text-primary">imLeGEnDco.</span> × <span className="text-primary">+FlowCode</span>
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  Hecho con ❤️ en: <span className="font-semibold">Lovable</span> & <span className="font-semibold">Antigravity</span>
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
