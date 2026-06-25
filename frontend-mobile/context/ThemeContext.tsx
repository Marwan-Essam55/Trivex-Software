import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme: systemColorScheme, setColorScheme } = useNativewindColorScheme();
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme from storage, fall back to system preference
  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = (await AsyncStorage.getItem('theme')) as Theme | null;
        if (stored === 'dark' || stored === 'light') {
          setTheme(stored);
          setColorScheme(stored);
        } else if (systemColorScheme === 'dark' || systemColorScheme === 'light') {
          setTheme(systemColorScheme);
          setColorScheme(systemColorScheme);
        }
      } catch (e) {
        console.warn('Failed to load theme:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTheme();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Sync nativewind so dark: classes fire across all screens
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
