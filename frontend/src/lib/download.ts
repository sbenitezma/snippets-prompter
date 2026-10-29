/** Saves text as a file through the browser's normal download flow. */
export function downloadText(filename: string, text: string, type: string): void {
  // The byte order mark tells Excel the CSV is UTF-8, so accents survive.
  const content = type === 'text/csv' ? `\uFEFF${text}` : text;
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** e.g. snippets-prompter-2026-10-28.csv */
export function datedFilename(extension: string, date = new Date()): string {
  return `snippets-prompter-${date.toISOString().slice(0, 10)}.${extension}`;
}
