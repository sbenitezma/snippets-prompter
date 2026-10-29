import { downloadText } from '../lib/download';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type RecoveryNoticeProps = {
  backupKey: string;
  onDismiss: () => void;
};

/** Shown when saved data could not be fully read, so it is never lost silently. */
export function RecoveryNotice({ backupKey, onDismiss }: RecoveryNoticeProps) {
  function download() {
    const raw = window.localStorage.getItem(backupKey) ?? '';
    downloadText('snippets-prompter-unreadable-data.json', raw, 'application/json');
  }

  return (
    <Card className="panel notice" aria-labelledby="recovery-heading">
      <h2 id="recovery-heading">Some saved prompts could not be read</h2>
      <p>
        The prompts that could be read are below. A copy of everything that was saved has been kept
        in this browser, so nothing is lost: download it to inspect or recover it.
      </p>
      <div className="actions">
        <Button onClick={download}>Download saved data</Button>
        <Button tone="secondary" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
