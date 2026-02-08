import { useState, useEffect, useCallback } from 'react';
import type { PromptTemplate } from '@/types/song';

const STORAGE_KEY = 'songwriting-prompt-library';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadPromptsFromStorage(): PromptTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultPrompts();
    return JSON.parse(stored);
  } catch {
    return getDefaultPrompts();
  }
}

function savePromptsToStorage(prompts: PromptTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  } catch (error) {
    console.error('Error saving prompts to localStorage:', error);
  }
}

function getDefaultPrompts(): PromptTemplate[] {
  return [
    {
      id: generateId(),
      name: 'Sino básico',
      content: '[Verse]\n[Chorus]\n[Bridge]',
      createdAt: Date.now(),
    },
  ];
}

export function usePromptLibrary() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadPromptsFromStorage();
    setPrompts(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      savePromptsToStorage(prompts);
    }
  }, [prompts, isLoaded]);

  const addPrompt = useCallback((name: string, content: string): PromptTemplate => {
    const newPrompt: PromptTemplate = {
      id: generateId(),
      name,
      content,
      createdAt: Date.now(),
    };
    setPrompts(prev => [...prev, newPrompt]);
    return newPrompt;
  }, []);

  const updatePrompt = useCallback((id: string, updates: Partial<PromptTemplate>): void => {
    setPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, []);

  const deletePrompt = useCallback((id: string): void => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  }, []);

  return {
    prompts,
    isLoaded,
    addPrompt,
    updatePrompt,
    deletePrompt,
  };
}
