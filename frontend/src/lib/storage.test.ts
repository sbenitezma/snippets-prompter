import { describe, expect, it } from 'vitest';
import type { Prompt } from '../types';
import { seedPrompts } from './seed';
import { BACKUP_PREFIX, loadPrompts, savePrompts, STORAGE_KEY } from './storage';

const valid: Prompt = { id: 'a', title: 'T', body: 'B', categories: ['x'] };

describe('storage', () => {
  it('returns the example prompts on first run', () => {
    expect(loadPrompts()).toEqual({ prompts: seedPrompts });
  });

  it('round-trips saved prompts', () => {
    savePrompts([valid]);
    expect(loadPrompts()).toEqual({ prompts: [valid] });
  });

  it('keeps an intentionally empty list empty (does not re-seed)', () => {
    savePrompts([]);
    expect(loadPrompts()).toEqual({ prompts: [] });
  });

  it('backs up corrupted JSON before it can be overwritten', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    const result = loadPrompts();
    expect(result.prompts).toEqual([]);
    expect(result.backupKey).toMatch(new RegExp(`^${BACKUP_PREFIX}`));
    expect(window.localStorage.getItem(result.backupKey!)).toBe('{not json');
  });

  it('keeps the valid entries and backs up the whole stored list', () => {
    const raw = JSON.stringify([valid, { id: 1 }]);
    window.localStorage.setItem(STORAGE_KEY, raw);
    const result = loadPrompts();
    expect(result.prompts).toEqual([valid]);
    expect(window.localStorage.getItem(result.backupKey!)).toBe(raw);
  });
});
