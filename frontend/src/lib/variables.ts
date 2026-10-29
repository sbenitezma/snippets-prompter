// Matches {{name}} with optional inner spaces. Names are English identifiers.
const VARIABLE_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

/** Unique variable names, in order of first appearance. */
export function extractVariables(body: string): string[] {
  const names: string[] = [];
  for (const match of body.matchAll(VARIABLE_PATTERN)) {
    const name = match[1];
    if (!names.includes(name)) names.push(name);
  }
  return names;
}

/**
 * Replaces each {{name}} with its value. Variables left empty keep their
 * placeholder so the result never silently loses a gap to fill.
 */
export function resolveVariables(body: string, values: Record<string, string>): string {
  return body.replace(VARIABLE_PATTERN, (placeholder, name: string) => {
    const value = values[name];
    return value && value.trim() !== '' ? value : placeholder;
  });
}
