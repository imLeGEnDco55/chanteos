import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RhymeSuggestions {
  rhymes: string[];
  related: string[];
}

export function useRhymeSuggestions() {
  const [suggestions, setSuggestions] = useState<RhymeSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (word: string) => {
    if (!word.trim()) return;
    
    const cleanWord = word.trim().toLowerCase().replace(/[^\wáéíóúüñ]/gi, '');
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('rhyme-suggestions', {
        body: { word: cleanWord }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestions({
        rhymes: data.rhymes || [],
        related: data.related || []
      });
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener sugerencias');
      setSuggestions(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (selectedWord) {
      fetchSuggestions(selectedWord);
    }
  }, [selectedWord, fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions(null);
    setSelectedWord(null);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    selectedWord,
    fetchSuggestions,
    retry,
    clearSuggestions
  };
}
