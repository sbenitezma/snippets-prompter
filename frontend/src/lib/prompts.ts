import type { Prompt } from '../types';

/** Generates an id; falls back when crypto.randomUUID is unavailable. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Parses the comma-separated categories field: trims, drops empties and
 * removes case-insensitive duplicates (the first spelling wins).
 */
export function parseCategories(input: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of input.split(',')) {
    const name = part.trim();
    const key = name.toLowerCase();
    if (name === '' || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

/** All categories in use, de-duplicated case-insensitively and sorted. */
export function allCategories(prompts: Prompt[]): string[] {
  const byKey = new Map<string, string>();
  for (const prompt of prompts) {
    for (const category of prompt.categories) {
      const key = category.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, category);
    }
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

/** Free-text search over title and body, plus an optional category filter. */
export function filterPrompts(
  prompts: Prompt[],
  query: string,
  category: string | null,
): Prompt[] {
  const needle = query.trim().toLowerCase();
  return prompts.filter((prompt) => {
    if (
      category !== null &&
      !prompt.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    ) {
      return false;
    }
    if (needle === '') return true;
    return (
      prompt.title.toLowerCase().includes(needle) ||
      prompt.body.toLowerCase().includes(needle)
    );
  });
}

/**
 * The prompt this one was created from, or undefined when there is no source
 * or it has been deleted (a dangling sourceId counts as "no source").
 */
export function findSource(
  prompts: Prompt[],
  prompt: Prompt,
): Prompt | undefined {
  if (!prompt.sourceId) return undefined;
  return prompts.find((candidate) => candidate.id === prompt.sourceId);
}
