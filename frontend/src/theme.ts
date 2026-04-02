export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'hl7-orchestrator-theme';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: ThemeMode): ThemeMode {
  if (typeof document === 'undefined') return theme;

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
  }

  return theme;
}

export function toggleTheme(currentTheme: ThemeMode): ThemeMode {
  return applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

export function initTheme(): ThemeMode {
  return applyTheme(getStoredTheme());
}
