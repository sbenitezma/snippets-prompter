import { useMemo, useState } from 'react';
import { PromptCard } from './components/PromptCard';
import { PromptForm } from './components/PromptForm';
import { VariablePanel } from './components/VariablePanel';
import { usePrompts } from './hooks/usePrompts';
import { allCategories, filterPrompts, findSource } from './lib/prompts';
import type { Prompt, PromptDraft } from './types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

/** What the panel above the list is doing right now. */
type Mode =
  | { kind: 'idle' }
  | { kind: 'create'; from?: Prompt }
  | { kind: 'edit'; prompt: Prompt }
  | { kind: 'use'; prompt: Prompt };

export default function App() {
  const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts();
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

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

  const close = () => setMode({ kind: 'idle' });

  function submit(draft: PromptDraft) {
    if (mode.kind === 'edit') updatePrompt(mode.prompt.id, draft);
    else if (mode.kind === 'create') addPrompt(draft, mode.from?.id);
    close();
  }

  function handleDelete(prompt: Prompt) {
    deletePrompt(prompt.id);
    if ('prompt' in mode && mode.prompt.id === prompt.id) close();
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Snippets Prompter</h1>
        <p>Store, organize and reuse your prompts. Everything stays in this browser.</p>
      </header>

      <div className="toolbar">
        <div className="toolbar-row">
          <Input
            type="search"
            label="Search prompts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button onClick={() => setMode({ kind: 'create' })}>New prompt</Button>
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

      <section aria-labelledby="list-heading">
        <h2 id="list-heading">Your prompts ({visible.length})</h2>
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
                  onUse={(p) => setMode({ kind: 'use', prompt: p })}
                  onEdit={(p) => setMode({ kind: 'edit', prompt: p })}
                  onCreateFrom={(p) => setMode({ kind: 'create', from: p })}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
