import { RefreshCw, Sparkles, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RhymePanelProps {
  isVisible: boolean;
  selectedWord: string | null;
  rhymes: string[];
  related: string[];
  isLoading: boolean;
  error: string | null;
  onWordClick: (word: string) => void;
  onRetry: () => void;
}

export function RhymePanel({
  isVisible,
  selectedWord,
  rhymes,
  related,
  isLoading,
  error,
  onWordClick,
  onRetry,
}: RhymePanelProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-zinc-950/40 backdrop-blur-md px-4 py-4 space-y-4 border-b border-white/5 animate-in slide-in-from-bottom duration-300">
      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <div className="relative">
            <div className="h-10 w-10 border-2 border-indigo-500/20 rounded-full animate-ping absolute" />
            <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
          <span className="text-xs font-medium text-indigo-300 tracking-widest uppercase">Consultando Oráculo...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-center text-red-400 text-xs font-mono bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
            {error}
          </p>
          <Button variant="ghost" size="sm" onClick={onRetry} className="text-zinc-400 hover:text-white">
            <RefreshCw className="h-3 w-3 mr-2" /> Reintentar
          </Button>
        </div>
      )}

      {/* No word selected */}
      {!selectedWord && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-500 space-y-2">
          <Hash className="h-8 w-8 opacity-20" />
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold">
            Selecciona una palabra para rimar
          </p>
        </div>
      )}

      {/* Suggestions */}
      {selectedWord && !isLoading && (rhymes.length > 0 || related.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Rimas: {selectedWord}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onRetry} className="h-6 w-6 text-zinc-600 hover:text-indigo-400">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Rhymes row */}
            {rhymes.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center justify-start">
                {rhymes.map((word, index) => (
                  <Button
                    key={`rhyme-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => onWordClick(word)}
                    className="bg-indigo-600/10 hover:bg-indigo-600 border-indigo-500/20 hover:border-indigo-400 text-indigo-300 hover:text-white text-xs px-3 h-8 rounded-full transition-all group active:scale-95"
                  >
                    {word}
                  </Button>
                ))}
              </div>
            )}

            {/* Related words row */}
            {related.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center justify-start border-t border-white/5 pt-3">
                {related.map((word, index) => (
                  <Button
                    key={`related-${index}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => onWordClick(word)}
                    className="text-zinc-500 hover:text-zinc-200 hover:bg-white/5 text-xs px-2 h-7 rounded-md transition-colors"
                  >
                    {word}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No results */}
      {selectedWord && !isLoading && !error && rhymes.length === 0 && related.length === 0 && (
        <div className="text-center py-6 text-zinc-500 text-xs">
          No se encontraron rimas para <span className="text-zinc-300 font-mono italic underline decoration-indigo-500/50">"{selectedWord}"</span>
        </div>
      )}
    </div>
  );
}
