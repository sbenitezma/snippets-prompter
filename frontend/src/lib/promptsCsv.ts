import type { Prompt, PromptDraft } from '../types';
import { parseCsv, toCsv } from './csv';
import { newId, parseCategories } from './prompts';
import { promptFormSchema } from './schema';

/**
 * Spreadsheet layout: one prompt per row. The columns people edit come first;
 * `id` and `sourceId` let a re-import update existing prompts instead of
 * duplicating them. Column order is free on import and names are matched
 * loosely ("Source ID", "source_id" and "sourceId" all work).
 */
export const CSV_COLUMNS = ['title', 'body', 'categories', 'id', 'sourceId'] as const;
type Column = (typeof CSV_COLUMNS)[number];

/**
 * Spreadsheets run cells that start with these characters as formulas (CSV
 * injection). Exported cells get a leading apostrophe, which spreadsheets
 * treat as "plain text"; import removes it again.
 */
const FORMULA_START = /^[=+\-@\t\r]/;
const guard = (cell: string) => (FORMULA_START.test(cell) ? `'${cell}` : cell);
const unguard = (cell: string) =>
  cell.startsWith("'") && FORMULA_START.test(cell.slice(1)) ? cell.slice(1) : cell;

export function exportPromptsCsv(prompts: Prompt[]): string {
  const rows = prompts.map((p) => [
    guard(p.title),
    guard(p.body),
    guard(p.categories.join(', ')),
    p.id,
    p.sourceId ?? '',
  ]);
  return toCsv([[...CSV_COLUMNS], ...rows]);
}

export type ImportRow = {
  row: number;
  id?: string;
  /** undefined: the file has no sourceId column (keep what is there); '': no source. */
  sourceId?: string;
  draft: PromptDraft;
};
export type ImportIssue = { row: number; message: string };
export type ParsedImport = { rows: ImportRow[]; issues: ImportIssue[] };

export class ImportError extends Error {}

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');

/** Reads a CSV export (from this app or a spreadsheet). Row numbers match the spreadsheet's. */
export function parsePromptsCsv(text: string): ParsedImport {
  const [header, ...records] = parseCsv(text);
  if (!header) throw new ImportError('The file is empty.');

  const index = new Map<Column, number>();
  header.forEach((name, i) => {
    const column = CSV_COLUMNS.find((c) => normalize(c) === normalize(name));
    if (column && !index.has(column)) index.set(column, i);
  });
  if (!index.has('title') || !index.has('body')) {
    throw new ImportError('The first row must name the columns, including “title” and “body”.');
  }

  const cell = (record: string[], column: Column) => {
    const i = index.get(column);
    return i === undefined ? '' : unguard(record[i] ?? '');
  };

  const rows: ImportRow[] = [];
  const issues: ImportIssue[] = [];
  const seenIds = new Set<string>();

  records.forEach((record, i) => {
    const row = i + 2; // Row 1 is the header.
    const parsed = promptFormSchema.safeParse({
      title: cell(record, 'title'),
      body: cell(record, 'body'),
      categories: cell(record, 'categories'),
    });
    if (!parsed.success) {
      issues.push({ row, message: parsed.error.issues.map((issue) => issue.message).join('; ') });
      return;
    }

    const id = cell(record, 'id').trim() || undefined;
    if (id && seenIds.has(id)) {
      issues.push({ row, message: `Duplicate id “${id}”; only the first row with it is used` });
      return;
    }
    if (id) seenIds.add(id);

    rows.push({
      row,
      id,
      sourceId: index.has('sourceId') ? cell(record, 'sourceId').trim() : undefined,
      draft: {
        title: parsed.data.title,
        body: parsed.data.body,
        categories: parseCategories(parsed.data.categories),
      },
    });
  });

  return { rows, issues };
}

const samePrompt = (a: Prompt, b: Prompt) =>
  a.title === b.title &&
  a.body === b.body &&
  a.sourceId === b.sourceId &&
  a.categories.join('\n') === b.categories.join('\n');

export type MergeResult = { prompts: Prompt[]; added: number; updated: number; unchanged: number };

/**
 * Adds imported rows to the collection. A row whose id matches an existing
 * prompt updates it in place; any other row becomes a new prompt. Nothing is
 * ever deleted by an import.
 */
export function mergePrompts(existing: Prompt[], rows: ImportRow[]): MergeResult {
  const byId = new Map(rows.filter((r) => r.id).map((r) => [r.id!, r]));
  let updated = 0;
  let unchanged = 0;

  const prompts = existing.map((prompt) => {
    const row = byId.get(prompt.id);
    if (!row) return prompt;
    byId.delete(prompt.id);
    const sourceId = row.sourceId === undefined ? prompt.sourceId : row.sourceId;
    const next: Prompt = { id: prompt.id, ...row.draft, ...(sourceId && { sourceId }) };
    if (samePrompt(next, prompt)) unchanged++;
    else updated++;
    return next;
  });

  const added = rows
    .filter((row) => !row.id || byId.has(row.id))
    .map((row): Prompt => ({
      id: row.id ?? newId(),
      ...row.draft,
      ...(row.sourceId && { sourceId: row.sourceId }),
    }));

  return { prompts: [...added, ...prompts], added: added.length, updated, unchanged };
}
