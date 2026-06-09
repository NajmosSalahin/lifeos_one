import { create } from 'zustand';

const THEMES = ['light', 'dark', 'gruvbox', 'catppuccin', 'nord', 'dracula', 'tokyo-night', 'everforest', 'solarized-dark', 'one-dark', 'rose-pine'] as const;

export type Theme = (typeof THEMES)[number];

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: typeof THEMES;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  themes: THEMES,
  setTheme: (theme) => {
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
    set({ theme });
  },
}));
