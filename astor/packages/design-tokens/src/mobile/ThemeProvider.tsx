/**
 * ThemeProvider para mobile (Expo/RN). Estrategia dark-first:
 *  - preference 'system' → sigue Appearance; si es null, cae en 'dark' (default dark).
 *  - preference 'light' | 'dark' → override explícito (desde profiles.theme).
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import { darkTheme, lightTheme, type Theme } from './theme';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  mode: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveMode(preference: ThemePreference, system: 'light' | 'dark' | null): 'light' | 'dark' {
  if (preference === 'light' || preference === 'dark') return preference;
  return system ?? 'dark'; // default dark cuando no hay señal del sistema
}

export function ThemeProvider({
  children,
  initialPreference = 'system',
}: {
  children: ReactNode;
  initialPreference?: ThemePreference;
}) {
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);
  const [system, setSystem] = useState<'light' | 'dark' | null>(
    Appearance.getColorScheme() ?? null,
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystem(colorScheme ?? null));
    return () => sub.remove();
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const mode = resolveMode(preference, system);
    return {
      theme: mode === 'dark' ? darkTheme : lightTheme,
      mode,
      preference,
      setPreference,
    };
  }, [preference, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  return ctx.theme;
}

export function useThemeControls(): Omit<ThemeContextValue, 'theme'> {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls debe usarse dentro de <ThemeProvider>.');
  const { mode, preference, setPreference } = ctx;
  return { mode, preference, setPreference };
}
