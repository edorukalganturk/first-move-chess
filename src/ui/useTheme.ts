import { useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'first-move.theme.v1';

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    // Theme controls still work for the current session when storage is unavailable.
  }
  return 'system';
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    update();
    media.addEventListener('change', update);
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) setPreference(readPreference());
    };
    window.addEventListener('storage', sync);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#14221d' : '#f7f8f3');
  }, [theme]);

  const chooseTheme = (next: ThemePreference) => {
    setPreference(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Keep the selected theme in memory.
    }
  };

  return { preference, theme, chooseTheme };
}
