import { useCallback, useEffect, useState } from 'react';
import { newId } from '../lib/prompts';
import { loadPrompts, savePrompts, type LoadResult } from '../lib/storage';
import type { Prompt, PromptDraft } from '../types';

/** Prompt collection persisted in localStorage. */
export function usePrompts() {
  // Loaded once: loadPrompts also writes a backup when stored data is unreadable.
  const [initial] = useState<LoadResult>(() => loadPrompts());
  const [prompts, setPrompts] = useState<Prompt[]>(initial.prompts);

  useEffect(() => {
    savePrompts(prompts);
  }, [prompts]);

  const addPrompt = useCallback((draft: PromptDraft, sourceId?: string) => {
    const prompt: Prompt = { id: newId(), ...draft, ...(sourceId ? { sourceId } : {}) };
    setPrompts((current) => [prompt, ...current]);
  }, []);

  const updatePrompt = useCallback((id: string, draft: PromptDraft) => {
    setPrompts((current) =>
      current.map((prompt) => (prompt.id === id ? { ...prompt, ...draft } : prompt)),
    );
  }, []);

  const deletePrompt = useCallback((id: string) => {
    setPrompts((current) => current.filter((prompt) => prompt.id !== id));
  }, []);

  return {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    /** Replaces the whole collection (used by import, after the user confirms). */
    replacePrompts: setPrompts,
    backupKey: initial.backupKey,
  };
}
