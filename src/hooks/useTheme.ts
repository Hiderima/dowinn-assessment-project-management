import { useState, useEffect } from 'react';

/** Light/dark theme hook — persists the choice in localStorage and toggles the `dark` class. */
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize from localStorage on first render (SSR-safe).
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Sync the <html> class and persist the choice whenever theme changes.
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  /** Flip between light and dark. */
  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggle };
}
