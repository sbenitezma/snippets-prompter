import { describe, expect, it } from 'vitest';
import type { Prompt } from '../types';
import { allCategories, filterPrompts, findSource, parseCategories } from './prompts';

const prompts: Prompt[] = [
  { id: '1', title: 'Teaser', body: 'Write a teaser', categories: ['Marketing'] },
  { id: '2', title: 'Review', body: 'Review code', categories: ['coding', 'marketing'] },
  { id: '3', title: 'Copy', body: 'Teaser copy', categories: [], sourceId: '1' },
];

describe('parseCategories', () => {
  it('trims, drops empties and removes case-insensitive duplicates', () => {
    expect(parseCategories(' a, B ,, b, A , c ')).toEqual(['a', 'B', 'c']);
  });

  it('returns an empty list for blank input', () => {
    expect(parseCategories('  ')).toEqual([]);
  });
});

describe('allCategories', () => {
  it('merges case variants and sorts', () => {
    expect(allCategories(prompts)).toEqual(['coding', 'Marketing']);
  });
});

describe('filterPrompts', () => {
  it('searches title and body, ignoring case', () => {
    expect(filterPrompts(prompts, 'TEASER', null).map((p) => p.id)).toEqual(['1', '3']);
  });

  it('filters by category, ignoring case', () => {
    expect(filterPrompts(prompts, '', 'marketing').map((p) => p.id)).toEqual(['1', '2']);
  });

  it('combines search and category', () => {
    expect(filterPrompts(prompts, 'review', 'marketing').map((p) => p.id)).toEqual(['2']);
  });
});

describe('findSource', () => {
  it('returns the source prompt when it exists', () => {
    expect(findSource(prompts, prompts[2])?.id).toBe('1');
  });

  it('treats a deleted source as no source', () => {
    expect(findSource([prompts[2]], prompts[2])).toBeUndefined();
  });

  it('returns undefined when the prompt has no sourceId', () => {
    expect(findSource(prompts, prompts[0])).toBeUndefined();
  });
});
