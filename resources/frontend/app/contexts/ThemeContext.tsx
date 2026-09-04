import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeLocalStorage } from '../utils/safeStorage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark'; // The actual rendered theme
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialResolvedTheme(initialTheme: Theme): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  if (initialTheme === 'dark') return 'dark';
  if (initialTheme === 'light') return 'light';
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {}
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = safeLocalStorage.getItem('bayu-theme') as Theme | null;
    return stored || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    return getInitialResolvedTheme(theme);
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (currentTheme: Theme) => {
      let isDark = false;
      if (currentTheme === 'system') {
        try {
          isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (e) {
          isDark = false;
        }
      } else {
        isDark = currentTheme === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
        setResolvedTheme('dark');
      } else {
        root.classList.remove('dark');
        setResolvedTheme('light');
      }
    };

    applyTheme(theme);
    safeLocalStorage.setItem('bayu-theme', theme);

    // Listen for system theme changes if set to 'system'
    let mediaQuery: MediaQueryList | null = null;
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      }
    } catch (e) {
      mediaQuery = null;
    }

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange);
      } else if (typeof (mediaQuery as any).addListener === 'function') {
        (mediaQuery as any).addListener(handleChange);
      }
    }

    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleChange);
        } else if (typeof (mediaQuery as any).removeListener === 'function') {
          (mediaQuery as any).removeListener(handleChange);
        }
      }
    };
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light'; // system -> light
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
