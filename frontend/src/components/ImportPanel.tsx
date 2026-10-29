import { useEffect, useId, useRef } from 'react';
import { closeOnEscape } from '../lib/keyboard';
import type { ImportIssue, MergeResult } from '../lib/promptsCsv';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type ImportPanelProps = {
  fileName: string;
  /** Present when the file was read; absent when it could not be used at all. */
  preview?: MergeResult;
  issues: ImportIssue[];
  error?: string;
  onConfirm: (preview: MergeResult) => void;
  onCancel: () => void;
};

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** Shows what an import would change and applies it only after confirmation. */
export function ImportPanel({
  fileName,
  preview,
  issues,
  error,
  onConfirm,
  onCancel,
}: ImportPanelProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const issuesId = useId();
  const changes = preview ? preview.added + preview.updated : 0;

  // Focus the heading, not a button: the summary below it is what to read first.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <Card className="panel" onKeyDown={closeOnEscape(onCancel)}>
      <h2 ref={heading} tabIndex={-1}>
        Import “{fileName}”
      </h2>
      {error ? (
        <p className="field-error">{error}</p>
      ) : (
        preview && (
          <ul className="import-summary">
            <li>{plural(preview.added, 'new prompt', 'new prompts')}</li>
            <li>{plural(preview.updated, 'prompt updated', 'prompts updated')}</li>
            {preview.unchanged > 0 && (
              <li>{plural(preview.unchanged, 'prompt unchanged', 'prompts unchanged')}</li>
            )}
          </ul>
        )
      )}
      {issues.length > 0 && (
        <section aria-labelledby={issuesId}>
          <h3 id={issuesId}>{plural(issues.length, 'row skipped', 'rows skipped')}</h3>
          <ul className="import-issues">
            {issues.map((issue) => (
              <li key={issue.row}>
                Row {issue.row}: {issue.message}
              </li>
            ))}
          </ul>
        </section>
      )}
      {!error && preview && changes === 0 && (
        <p className="empty">Nothing to import: your prompts already match this file.</p>
      )}
      <p className="field-hint">
        Importing adds new prompts and updates the ones with a matching id. It never deletes.
      </p>
      <div className="actions">
        {preview && changes > 0 && (
          <Button onClick={() => onConfirm(preview)}>
            Import {plural(changes, 'prompt', 'prompts')}
          </Button>
        )}
        <Button tone="secondary" onClick={onCancel}>
          {preview && changes > 0 ? 'Cancel' : 'Close'}
        </Button>
      </div>
    </Card>
  );
}
