import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-1.5 p-2 pt-3">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-2 text-primary-foreground/80 text-xs">
            {error}
          </div>
        )}

        {/* No word selected */}
        {!selectedWord && !isLoading && !error && (
          <div className="text-center py-3 text-primary-foreground/60 text-xs leading-tight">
            Selecciona una palabra
          </div>
        )}

        {/* Rhyme suggestions */}
        {selectedWord && !isLoading && (rhymes.length > 0 || related.length > 0) && (
          <>
            {rhymes.map((word, index) => (
              <Button
                key={`rhyme-${index}`}
                variant="secondary"
                size="sm"
                onClick={() => onWordClick(word)}
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 text-xs px-2 py-1.5 h-auto w-full justify-center"
              >
                {word}
              </Button>
            ))}

            {/* Separator */}
            {rhymes.length > 0 && related.length > 0 && (
              <div className="border-t border-primary-foreground/20 my-1" />
            )}

            {related.map((word, index) => (
              <Button
                key={`related-${index}`}
                variant="secondary"
                size="sm"
                onClick={() => onWordClick(word)}
                className="bg-accent/80 hover:bg-accent text-accent-foreground border-0 text-xs px-2 py-1.5 h-auto w-full justify-center"
              >
                {word}
              </Button>
            ))}

            {/* Retry */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 px-2 py-1.5 h-auto w-full justify-center mt-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        {/* No results */}
        {selectedWord && !isLoading && !error && rhymes.length === 0 && related.length === 0 && (
          <div className="text-center py-2 text-primary-foreground/60 text-xs leading-tight">
            Sin resultados para "{selectedWord}"
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
