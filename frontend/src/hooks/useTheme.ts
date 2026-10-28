import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

/** Also read by the inline script in index.html, which applies it before first paint. */
export const THEME_KEY = 'snippets-prompter:theme';

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

/**
 * Colour theme chosen by the user. "system" follows the OS setting; the other
 * two pin it by setting `data-theme` on <html> (see styles/tokens.css).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;

    try {
      if (theme === 'system') window.localStorage.removeItem(THEME_KEY);
      else window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Best-effort, like prompt persistence: the choice still applies for this visit.
    }
  }, [theme]);

  return [theme, setTheme] as const;
}
