import { useId, useState } from 'react';
import { extractVariables, resolveVariables } from '../lib/variables';
import type { Prompt } from '../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

type VariablePanelProps = {
  prompt: Prompt;
  onClose: () => void;
};

/** Fill in a prompt's {{variables}}, preview the result and copy it. */
export function VariablePanel({ prompt, onClose }: VariablePanelProps) {
  const variables = extractVariables(prompt.body);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const previewId = useId();

  const resolved = resolveVariables(prompt.body, values);

  async function copy() {
    try {
      await navigator.clipboard.writeText(resolved);
      setStatus('Copied to clipboard.');
    } catch {
      setStatus('Could not copy automatically. Select the preview and copy it manually.');
    }
  }

  return (
    <Card className="panel">
      <h2>Use “{prompt.title}”</h2>
      {variables.length === 0 ? (
        <p className="empty">This prompt has no variables, so it is ready to copy.</p>
      ) : (
        <div className="form-grid">
          {variables.map((name) => (
            <Input
              key={name}
              label={name}
              value={values[name] ?? ''}
              onChange={(event) =>
                setValues((current) => ({ ...current, [name]: event.target.value }))
              }
            />
          ))}
        </div>
      )}
      <h3 id={previewId}>Preview</h3>
      <pre className="preview" aria-labelledby={previewId}>
        {resolved}
      </pre>
      <div className="actions">
        <Button onClick={copy}>Copy to clipboard</Button>
        <Button tone="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
      <p className="status" role="status">
        {status}
      </p>
    </Card>
  );
}
