'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: {
    bg: string; bg2: string; bg3: string;
    text: string; textMuted: string; textFaint: string;
    border: string; card: string; gold: string; input: string;
    navBg: string;
  };
}

const dark = {
  bg: '#0a0a0a', bg2: '#111111', bg3: '#1a1a1a',
  text: '#ffffff', textMuted: 'rgba(255,255,255,0.45)', textFaint: 'rgba(255,255,255,0.2)',
  border: 'rgba(255,255,255,0.07)', card: '#111111', gold: '#C8A96B',
  input: '#1a1a1a', navBg: 'rgba(10,10,10,0.97)',
};

const light = {
  bg: '#f8f8f6', bg2: '#ffffff', bg3: '#f0f0ee',
  text: '#0a0a0a', textMuted: 'rgba(0,0,0,0.5)', textFaint: 'rgba(0,0,0,0.28)',
  border: 'rgba(0,0,0,0.08)', card: '#ffffff', gold: '#A8872A',
  input: '#f0f0ee', navBg: 'rgba(248,248,246,0.97)',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark', toggleTheme: () => {}, isDark: true, colors: dark,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('veyra-theme') as Theme | null;
    if (saved) apply(saved);
  }, []);

  const apply = (t: Theme) => {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    document.body.style.background = t === 'dark' ? '#0a0a0a' : '#f8f8f6';
    document.body.style.color = t === 'dark' ? '#ffffff' : '#0a0a0a';
    // Set CSS variables
    const c = t === 'dark' ? dark : light;
    const root = document.documentElement;
    root.style.setProperty('--bg', c.bg);
    root.style.setProperty('--bg2', c.bg2);
    root.style.setProperty('--bg3', c.bg3);
    root.style.setProperty('--text', c.text);
    root.style.setProperty('--text-muted', c.textMuted);
    root.style.setProperty('--text-faint', c.textFaint);
    root.style.setProperty('--border', c.border);
    root.style.setProperty('--card', c.card);
    root.style.setProperty('--gold', c.gold);
    root.style.setProperty('--input', c.input);
    root.style.setProperty('--nav-bg', c.navBg);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('veyra-theme', next);
    apply(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', colors: theme === 'dark' ? dark : light }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
