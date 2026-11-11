import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "learnv-theme-v1";
const DARK_QUERY = "(prefers-color-scheme: dark)";
/** Matches each theme's page background (`--cream`) so mobile browser chrome blends in. */
export const THEME_COLORS: Record<Theme, string> = { light: "#fffaf1", dark: "#140b19" };

type ThemeContextValue = {
  theme: Theme;
  /** True once the person picked a theme; until then LearnV follows the system setting. */
  isExplicit: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function savedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [explicitTheme, setExplicitTheme] = useState<Theme | null>(savedTheme);
  const [system, setSystem] = useState<Theme>(systemTheme);
  const theme = explicitTheme ?? system;

  // Follow OS changes until the person makes an explicit choice.
  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return;
    const onChange = () => setSystem(media.matches ? "dark" : "light");
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setExplicitTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* Keep the preference in memory. */ }
  }, []);

  const value = useMemo(
    () => ({ theme, isExplicit: explicitTheme !== null, setTheme, toggleTheme: () => setTheme(theme === "light" ? "dark" : "light") }),
    [theme, explicitTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
