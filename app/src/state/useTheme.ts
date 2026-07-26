import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'dtv.theme';
export const DEFAULT_THEME: Theme = 'dark';

function readStored(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    // Private mode / Capacitor WebView with storage disabled.
  }
  return DEFAULT_THEME;
}

/**
 * Theme is an explicit choice, not a mirror of the OS setting: the original
 * K-99693 is a light device, and someone picking "light" wants the authentic
 * look regardless of what their phone is doing at the time.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStored);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0b0b0c' : '#e9e9e7');
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not fatal — the choice just won't survive a reload.
    }
  }, []);

  return { theme, setTheme };
}
