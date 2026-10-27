import { z } from 'zod';
import type { Prompt } from '../types';
import { seedPrompts } from './seed';

export const STORAGE_KEY = 'snippets-prompter:v1';

const storedPromptsSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    body: z.string(),
    categories: z.array(z.string()),
    sourceId: z.string().optional(),
  }),
);

/**
 * Loads prompts from localStorage.
 * - Nothing stored yet (first run): the example prompts.
 * - Stored but unreadable or invalid: an empty list, so the app never crashes
 *   on corrupted data.
 */
export function loadPrompts(storage: Storage = window.localStorage): Prompt[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return seedPrompts;
    const parsed = storedPromptsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/** Saves prompts; ignores storage failures (private mode, quota exceeded). */
export function savePrompts(
  prompts: Prompt[],
  storage: Storage = window.localStorage,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  } catch {
    // Persistence is best-effort; the app keeps working in memory.
  }
}
