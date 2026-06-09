import { useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const saved = localStorage.getItem('theme') as string | null;
    if (saved && saved !== theme) {
      setTheme(saved as typeof theme);
    } else {
      document.documentElement.className = `theme-${theme}`;
    }
  }, []);

  return <>{children}</>;
}
