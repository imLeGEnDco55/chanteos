import { useState, useCallback } from 'react';
import { generateRhymes } from '@/lib/gemini';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

interface RhymeSuggestions {
  rhymes: string[];
  related: string[];
}

export function useRhymeSuggestions() {
  const [suggestions, setSuggestions] = useState<RhymeSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { apiKey, model } = useSettings();

  const fetchSuggestions = useCallback(async (word: string) => {
    if (!word.trim()) return;

    // Check for API Key first
    if (!apiKey) {
      toast.error('Configura tu API Key de Gemini en Ajustes para ver sugerencias');
      setError('Falta API Key');
      return;
    }

    const cleanWord = word.trim().toLowerCase().replace(/[^\wáéíóúüñ]/gi, '');
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setIsLoading(true);
    setError(null);

    try {
      const data = await generateRhymes(cleanWord, apiKey, model);

      setSuggestions({
        rhymes: data.rhymes || [],
        related: data.related || []
      });
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener sugerencias');
      toast.error('Error al conectar con la IA');
      setSuggestions(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, model]);

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
