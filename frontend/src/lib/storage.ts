import { z } from 'zod';
import type { Prompt } from '../types';
import { seedPrompts } from './seed';

export const STORAGE_KEY = 'snippets-prompter:v1';
/** Prefix for verbatim copies of stored data that could not be fully read. */
export const BACKUP_PREFIX = `${STORAGE_KEY}:backup:`;

const storedPromptSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  categories: z.array(z.string()),
  sourceId: z.string().optional(),
});

export type LoadResult = {
  prompts: Prompt[];
  /** Set when stored data was unreadable: where its verbatim copy was kept. */
  backupKey?: string;
};

/**
 * Loads prompts from localStorage.
 * - Nothing stored yet (first run): the example prompts.
 * - Stored data unreadable, or some entries invalid: the valid entries are
 *   kept, and the raw data is copied to a backup key first. The next save
 *   overwrites STORAGE_KEY, so without the copy that data would be lost.
 */
export function loadPrompts(storage: Storage = window.localStorage): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { prompts: [] }; // Storage blocked: nothing to recover from.
  }
  if (raw === null) return { prompts: seedPrompts };

  let entries: unknown;
  try {
    entries = JSON.parse(raw);
  } catch {
    entries = null;
  }

  const items = Array.isArray(entries) ? entries : [];
  const prompts = items.flatMap((item) => {
    const parsed = storedPromptSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });

  if (Array.isArray(entries) && prompts.length === entries.length) return { prompts };
  return { prompts, backupKey: backup(raw, storage) };
}

function backup(raw: string, storage: Storage): string | undefined {
  const key = `${BACKUP_PREFIX}${new Date().toISOString()}`;
  try {
    storage.setItem(key, raw);
    return key;
  } catch {
    return undefined; // Quota exceeded: the data is still shown, just not copied.
  }
}

/** Saves prompts; ignores storage failures (private mode, quota exceeded). */
export function savePrompts(prompts: Prompt[], storage: Storage = window.localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  } catch {
    // Persistence is best-effort; the app keeps working in memory.
  }
}
