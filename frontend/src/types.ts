/**
 * A saved prompt. Flattened version of the relational design in
 * docs/data-model.md: categories live on the prompt itself.
 *
 * `sourceId` points at the prompt this one was created from. The source may
 * have been deleted since, so readers must use `findSource` instead of
 * assuming the id still resolves (same effect as ON DELETE SET NULL).
 */
export interface Prompt {
  id: string;
  title: string;
  body: string;
  categories: string[];
  sourceId?: string;
}

/** The editable part of a prompt (what the form produces). */
export type PromptDraft = Pick<Prompt, 'title' | 'body' | 'categories'>;
