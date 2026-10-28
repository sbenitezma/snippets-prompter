import { describe, expect, it } from 'vitest';
import type { Prompt } from '../types';
import {
  exportPromptsCsv,
  ImportError,
  mergePrompts,
  parsePromptsCsv,
  type ImportRow,
} from './promptsCsv';
import { seedPrompts } from './seed';

describe('exportPromptsCsv / parsePromptsCsv', () => {
  it('round-trips the example prompts, including line breaks and sources', () => {
    const { rows, issues } = parsePromptsCsv(exportPromptsCsv(seedPrompts));
    expect(issues).toEqual([]);
    expect(mergePrompts([], rows).prompts.sort((a, b) => a.id.localeCompare(b.id))).toEqual(
      seedPrompts,
    );
  });

  it('writes the columns people edit first', () => {
    expect(exportPromptsCsv([]).split('\r\n')[0]).toBe('title,body,categories,id,sourceId');
  });

  it('neutralises cells a spreadsheet would run as formulas, and restores them on import', () => {
    const risky: Prompt = { id: 'r', title: '=HYPERLINK("x")', body: '- a list', categories: [] };
    const csv = exportPromptsCsv([risky]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain(`'- a list`);
    expect(parsePromptsCsv(csv).rows[0].draft).toMatchObject({
      title: '=HYPERLINK("x")',
      body: '- a list',
    });
  });

  it('accepts a hand-made sheet: any column order, loose names, semicolons, no ids', () => {
    const csv = 'Categories;Body;Title\nwork, Work, email;Hi {{name}};Greeting\n';
    const { rows } = parsePromptsCsv(csv);
    expect(rows).toEqual([
      {
        row: 2,
        id: undefined,
        sourceId: undefined,
        draft: { title: 'Greeting', body: 'Hi {{name}}', categories: ['work', 'email'] },
      },
    ]);
  });

  it('reports invalid and duplicate rows with their spreadsheet row number', () => {
    const csv = 'title,body,id\nOk,Body,a\n,Body,b\nAgain,Body,a\n';
    const { rows, issues } = parsePromptsCsv(csv);
    expect(rows.map((r) => r.row)).toEqual([2]);
    expect(issues).toEqual([
      { row: 3, message: 'Title is required' },
      { row: 4, message: 'Duplicate id “a”; only the first row with it is used' },
    ]);
  });

  it('rejects files without the required header', () => {
    expect(() => parsePromptsCsv('')).toThrow(ImportError);
    expect(() => parsePromptsCsv('name,text\nA,B')).toThrow(/“title” and “body”/);
  });
});

describe('mergePrompts', () => {
  const existing: Prompt[] = [
    { id: 'a', title: 'A', body: 'Body A', categories: ['x'], sourceId: 's' },
    { id: 'b', title: 'B', body: 'Body B', categories: [] },
  ];
  const row = (fields: Partial<ImportRow> & Pick<ImportRow, 'draft'>): ImportRow => ({
    row: 2,
    ...fields,
  });

  it('updates by id, adds the rest and never deletes', () => {
    const result = mergePrompts(existing, [
      row({ id: 'a', draft: { title: 'A2', body: 'Body A', categories: ['x'] } }),
      row({ id: 'new', draft: { title: 'N', body: 'Body N', categories: [] } }),
      row({ draft: { title: 'No id', body: 'Body', categories: [] } }),
    ]);
    expect(result).toMatchObject({ added: 2, updated: 1, unchanged: 0 });
    expect(result.prompts.map((p) => p.title)).toEqual(['N', 'No id', 'A2', 'B']);
  });

  it('counts identical rows as unchanged', () => {
    const result = mergePrompts(existing, [
      row({ id: 'b', sourceId: '', draft: { title: 'B', body: 'Body B', categories: [] } }),
    ]);
    expect(result).toMatchObject({ added: 0, updated: 0, unchanged: 1 });
  });

  it('keeps an existing source when the file has no sourceId column', () => {
    const result = mergePrompts(existing, [
      row({ id: 'a', draft: { title: 'A', body: 'Body A', categories: ['x'] } }),
    ]);
    expect(result.prompts[0].sourceId).toBe('s');
    expect(result.unchanged).toBe(1);
  });
});
