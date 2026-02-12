import { memo } from 'react';
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

/**
 * Memoized to prevent re-renders when parent AudioPlayer re-renders on time updates.
 * Props (rhymes, related, callbacks) are stable.
 */
export const RhymePanel = memo(function RhymePanel({
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

  const hasResults = rhymes.length > 0 || related.length > 0;

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex h-full flex-col gap-3 p-3">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 py-6">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/80 border-t-transparent" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/15 p-2.5 text-center">
            <div className="text-xs text-primary-foreground/90">{error}</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="h-7 w-full border-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* No word selected */}
        {!selectedWord && !isLoading && !error && (
          <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 py-3 text-center text-xs leading-tight text-primary-foreground/60">
            Selecciona una palabra
          </div>
        )}

        {/* Rhyme suggestions */}
        {selectedWord && !isLoading && hasResults && (
          <>
            <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-2">
              <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/70">
                Rimas
              </div>
              <div className="scrollbar-hide overflow-x-auto">
                <div className="flex min-w-max gap-1.5 pb-0.5">
                  {rhymes.map((word, index) => (
                    <Button
                      key={`rhyme-${index}`}
                      variant="secondary"
                      size="sm"
                      onClick={() => onWordClick(word)}
                      className="h-7 border-0 bg-primary-foreground/20 px-3 text-xs text-primary-foreground hover:bg-primary-foreground/30"
                    >
                      {word}
                    </Button>
                  ))}
                  {rhymes.length === 0 && (
                    <span className="px-2 text-xs text-primary-foreground/55">Sin rimas directas</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-2">
              <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/70">
                Contexto
              </div>
              <div className="scrollbar-hide overflow-x-auto">
                <div className="flex min-w-max gap-1.5 pb-0.5">
                  {related.map((word, index) => (
                    <Button
                      key={`related-${index}`}
                      variant="secondary"
                      size="sm"
                      onClick={() => onWordClick(word)}
                      className="h-7 border-0 bg-accent/85 px-3 text-xs text-accent-foreground hover:bg-accent"
                    >
                      {word}
                    </Button>
                  ))}
                  {related.length === 0 && (
                    <span className="px-2 text-xs text-primary-foreground/55">Sin relacionadas</span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className="h-8 w-full border-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </>
        )}

        {/* No results */}
        {selectedWord && !isLoading && !error && !hasResults && (
          <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 py-3 text-center text-xs leading-tight text-primary-foreground/60">
            Sin resultados para "{selectedWord}"
          </div>
        )}
      </div>
    </ScrollArea>
  );
});
