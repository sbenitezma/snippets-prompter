import type { KeyboardEvent } from 'react';

/** onKeyDown handler for panels: Escape closes them, like a dialog would. */
export function closeOnEscape(onClose: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };
}
