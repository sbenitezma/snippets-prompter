import { describe, expect, it } from 'vitest';
import type { Prompt } from '../types';
import { seedPrompts } from './seed';
import { loadPrompts, savePrompts, STORAGE_KEY } from './storage';

describe('storage', () => {
  it('returns the example prompts on first run', () => {
    expect(loadPrompts()).toEqual(seedPrompts);
  });

  it('round-trips saved prompts', () => {
    const saved: Prompt[] = [{ id: 'a', title: 'T', body: 'B', categories: ['x'] }];
    savePrompts(saved);
    expect(loadPrompts()).toEqual(saved);
  });

  it('keeps an intentionally empty list empty (does not re-seed)', () => {
    savePrompts([]);
    expect(loadPrompts()).toEqual([]);
  });

  it('survives corrupted JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadPrompts()).toEqual([]);
  });

  it('survives data with the wrong shape', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 1 }]));
    expect(loadPrompts()).toEqual([]);
  });
});
