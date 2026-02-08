import { RefreshCw } from 'lucide-react';
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
    <div className="bg-primary px-3 py-3 space-y-2">
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
          <span className="ml-2 text-sm text-primary-foreground">Buscando...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-2 text-primary-foreground/80 text-sm">
          {error}
        </div>
      )}

      {/* No word selected */}
      {!selectedWord && !isLoading && !error && (
        <div className="text-center py-3 text-primary-foreground/80 text-sm">
          Selecciona una palabra en las letras para ver rimas
        </div>
      )}

      {/* Suggestions */}
      {selectedWord && !isLoading && (rhymes.length > 0 || related.length > 0) && (
        <>
          {/* Rhymes row */}
          <div className="flex flex-wrap gap-2 items-center">
            {rhymes.map((word, index) => (
              <Button
                key={`rhyme-${index}`}
                variant="secondary"
                size="sm"
                onClick={() => onWordClick(word)}
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 text-sm px-3 py-1 h-auto"
              >
                {word}
              </Button>
            ))}
          </div>

          {/* Related words row */}
          <div className="flex flex-wrap gap-2 items-center">
            {related.map((word, index) => (
              <Button
                key={`related-${index}`}
                variant="secondary"
                size="sm"
                onClick={() => onWordClick(word)}
                className="bg-accent/80 hover:bg-accent text-accent-foreground border-0 text-sm px-3 py-1 h-auto"
              >
                {word}
              </Button>
            ))}
            
            {/* Retry button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 px-3 py-1 h-auto ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* No results */}
      {selectedWord && !isLoading && !error && rhymes.length === 0 && related.length === 0 && (
        <div className="text-center py-2 text-primary-foreground/80 text-sm">
          No se encontraron sugerencias para "{selectedWord}"
        </div>
      )}
    </div>
  );
}
