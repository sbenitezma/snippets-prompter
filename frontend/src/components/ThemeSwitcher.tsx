import { useId } from 'react';
import { useTheme, type Theme } from '../hooks/useTheme';

/** A native <select>: keyboard and screen reader support come for free. */
export function ThemeSwitcher() {
  const [theme, setTheme] = useTheme();
  const id = useId();

  return (
    <div className="field theme-switcher">
      <label htmlFor={id}>Theme</label>
      <select id={id} value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
