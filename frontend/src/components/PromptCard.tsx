import { useState } from 'react';
import type { Prompt } from '../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type PromptCardProps = {
  prompt: Prompt;
  /** Resolved source prompt, or undefined when none / deleted. */
  source?: Prompt;
  onUse: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onCreateFrom: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
};

export function PromptCard({
  prompt,
  source,
  onUse,
  onEdit,
  onCreateFrom,
  onDelete,
}: PromptCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card className="prompt-card">
      <h3>{prompt.title}</h3>
      {(prompt.categories.length > 0 || source) && (
        <div className="prompt-meta">
          {prompt.categories.map((category) => (
            <span className="tag" key={category}>
              {category}
            </span>
          ))}
          {source && <span>Created from: {source.title}</span>}
        </div>
      )}
      <p className="prompt-body">{prompt.body}</p>
      <div className="actions">
        <Button onClick={() => onUse(prompt)} aria-label={`Use ${prompt.title}`}>
          Use
        </Button>
        <Button
          tone="secondary"
          onClick={() => onEdit(prompt)}
          aria-label={`Edit ${prompt.title}`}
        >
          Edit
        </Button>
        <Button
          tone="secondary"
          onClick={() => onCreateFrom(prompt)}
          aria-label={`Create from ${prompt.title}`}
        >
          Create from
        </Button>
        {confirming ? (
          <>
            <Button
              tone="danger"
              onClick={() => onDelete(prompt)}
              aria-label={`Confirm delete ${prompt.title}`}
            >
              Confirm delete
            </Button>
            <Button
              tone="secondary"
              onClick={() => setConfirming(false)}
              aria-label={`Keep ${prompt.title}`}
            >
              Keep
            </Button>
          </>
        ) : (
          <Button
            tone="danger"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${prompt.title}`}
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
