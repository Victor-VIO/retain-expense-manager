import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'retain_theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // storage blocked – fall back to the system setting
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#f5f5f7');
}

// Light / dark mode. Bootstrap reads data-bs-theme on <html>; our own colours follow it too.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = themeRef.current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // not saved, still switches for this visit
    }
    const commit = () => {
      flushSync(() => setTheme(next));
      applyTheme(next);
    };

    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return commit();

    // Modern browsers: the whole screen cross-fades to the new appearance, like macOS and iOS.
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(commit).ready.catch(() => {});
      return;
    }

    // Older browsers: fade every colour across instead of snapping.
    root.classList.add('theme-fading');
    commit();
    window.setTimeout(() => root.classList.remove('theme-fading'), 450);
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
