import { useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ImportPanel } from './components/ImportPanel';
import { PromptCard } from './components/PromptCard';
import { PromptForm } from './components/PromptForm';
import { RecoveryNotice } from './components/RecoveryNotice';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { VariablePanel } from './components/VariablePanel';
import { usePrompts } from './hooks/usePrompts';
import { datedFilename, downloadText } from './lib/download';
import { allCategories, filterPrompts, findSource } from './lib/prompts';
import {
  exportPromptsCsv,
  ImportError,
  mergePrompts,
  parsePromptsCsv,
  type ImportIssue,
  type MergeResult,
} from './lib/promptsCsv';
import type { Prompt, PromptDraft } from './types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

/** What the panel above the list is doing right now. */
type Mode =
  | { kind: 'idle' }
  | { kind: 'create'; from?: Prompt }
  | { kind: 'edit'; prompt: Prompt }
  | { kind: 'use'; prompt: Prompt }
  | {
      kind: 'import';
      fileName: string;
      preview?: MergeResult;
      issues: ImportIssue[];
      error?: string;
    };

export default function App() {
  const { prompts, addPrompt, updatePrompt, deletePrompt, replacePrompts, backupKey } =
    usePrompts();
  const [showRecovery, setShowRecovery] = useState(backupKey !== undefined);
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  // Announced to screen readers: the panels and the list change silently otherwise.
  const [announcement, setAnnouncement] = useState('');
  const listHeading = useRef<HTMLHeadingElement>(null);
  // The button that opened the panel, so closing it puts focus back where the user was.
  const opener = useRef<HTMLElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => allCategories(prompts), [prompts]);
  const visible = useMemo(
    () => filterPrompts(prompts, query, category),
    [prompts, query, category],
  );

  // A selected category can disappear (its last prompt deleted or edited).
  const activeCategory =
    category !== null && categories.some((c) => c.toLowerCase() === category.toLowerCase())
      ? category
      : null;
  const filtering = query.trim() !== '' || activeCategory !== null;

  function open(next: Mode) {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setAnnouncement('');
    setMode(next);
  }

  function close() {
    flushSync(() => setMode({ kind: 'idle' }));
    const target = opener.current?.isConnected ? opener.current : listHeading.current;
    target?.focus();
    opener.current = null;
  }

  function submit(draft: PromptDraft) {
    if (mode.kind === 'edit') updatePrompt(mode.prompt.id, draft);
    else if (mode.kind === 'create') addPrompt(draft, mode.from?.id);
    setAnnouncement(`Saved “${draft.title}”.`);
    close();
  }

  function handleDelete(prompt: Prompt) {
    flushSync(() => {
      deletePrompt(prompt.id);
      if ('prompt' in mode && mode.prompt.id === prompt.id) setMode({ kind: 'idle' });
      setAnnouncement(`Deleted “${prompt.title}”.`);
    });
    // The card (and the focused button in it) is gone: land on the list instead.
    listHeading.current?.focus();
  }

  function exportCsv() {
    const filename = datedFilename('csv');
    downloadText(filename, exportPromptsCsv(prompts), 'text/csv');
    setAnnouncement(`Exported ${prompts.length} prompts to ${filename}.`);
  }

  async function importFile(file: File) {
    const fileName = file.name;
    try {
      const { rows, issues } = parsePromptsCsv(await file.text());
      open({ kind: 'import', fileName, preview: mergePrompts(prompts, rows), issues });
    } catch (error) {
      const message =
        error instanceof ImportError ? error.message : 'The file could not be read as CSV.';
      open({ kind: 'import', fileName, issues: [], error: message });
    }
  }

  function confirmImport(preview: MergeResult) {
    replacePrompts(preview.prompts);
    setAnnouncement(`Imported ${preview.added} new and ${preview.updated} updated prompts.`);
    close();
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Snippets Prompter</h1>
          <p>Store, organize and reuse your prompts. Everything stays in this browser.</p>
        </div>
        <ThemeSwitcher />
      </header>

      <main>
        <div className="toolbar">
          <div className="toolbar-row">
            <Input
              type="search"
              label="Search prompts"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button onClick={() => open({ kind: 'create' })}>New prompt</Button>
          </div>
          <div className="toolbar-row">
            <Button tone="secondary" onClick={() => fileInput.current?.click()}>
              Import CSV
            </Button>
            <Button tone="secondary" onClick={exportCsv}>
              Export CSV
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              aria-label="CSV file to import"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = ''; // Choosing the same file again still triggers a change.
                if (file) void importFile(file);
              }}
            />
          </div>
          {categories.length > 0 && (
            <fieldset className="chips">
              <legend>Filter by category</legend>
              <button
                type="button"
                className="chip"
                aria-pressed={activeCategory === null}
                onClick={() => setCategory(null)}
              >
                All
              </button>
              {categories.map((name) => (
                <button
                  type="button"
                  className="chip"
                  key={name}
                  aria-pressed={activeCategory?.toLowerCase() === name.toLowerCase()}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </button>
              ))}
            </fieldset>
          )}
        </div>

        {showRecovery && backupKey && (
          <RecoveryNotice backupKey={backupKey} onDismiss={() => setShowRecovery(false)} />
        )}

        {mode.kind === 'create' && (
          <PromptForm
            key={mode.from?.id ?? 'new'}
            heading={mode.from ? 'New prompt from existing' : 'New prompt'}
            initial={
              mode.from
                ? {
                    title: `${mode.from.title} (copy)`,
                    body: mode.from.body,
                    categories: mode.from.categories,
                  }
                : undefined
            }
            onSubmit={submit}
            onCancel={close}
          />
        )}
        {mode.kind === 'edit' && (
          <PromptForm
            key={mode.prompt.id}
            heading="Edit prompt"
            initial={mode.prompt}
            onSubmit={submit}
            onCancel={close}
          />
        )}
        {mode.kind === 'use' && (
          <VariablePanel key={mode.prompt.id} prompt={mode.prompt} onClose={close} />
        )}
        {mode.kind === 'import' && (
          <ImportPanel
            key={mode.fileName}
            fileName={mode.fileName}
            preview={mode.preview}
            issues={mode.issues}
            error={mode.error}
            onConfirm={confirmImport}
            onCancel={close}
          />
        )}

        <section aria-labelledby="list-heading">
          <h2 id="list-heading" ref={listHeading} tabIndex={-1}>
            Your prompts ({visible.length})
          </h2>
          {visible.length === 0 ? (
            <p className="empty">
              {prompts.length === 0
                ? 'No prompts yet. Create your first one with “New prompt”.'
                : 'No prompts match your search or filter.'}
            </p>
          ) : (
            <ul className="prompt-list">
              {visible.map((prompt) => (
                <li key={prompt.id}>
                  <PromptCard
                    prompt={prompt}
                    source={findSource(prompts, prompt)}
                    onUse={(p) => open({ kind: 'use', prompt: p })}
                    onEdit={(p) => open({ kind: 'edit', prompt: p })}
                    onCreateFrom={(p) => open({ kind: 'create', from: p })}
                    onDelete={handleDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="visually-hidden" role="status">
          {filtering
            ? `${visible.length} ${visible.length === 1 ? 'prompt matches' : 'prompts match'}.`
            : ''}
        </p>
        <p className="visually-hidden" role="status">
          {announcement}
        </p>
      </main>
    </div>
  );
}
