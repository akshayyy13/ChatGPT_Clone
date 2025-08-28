"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
type Ctx = { theme: ThemeMode; setTheme: (t: ThemeMode) => void };

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");

  // initial load
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as ThemeMode) || "system";
    setThemeState(saved);
  }, []);

  // apply to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "system");
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("system");
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = () => root.classList.toggle("dark", mq.matches);
      apply();
      mq.addEventListener?.("change", apply);
      return () => mq.removeEventListener?.("change", apply);
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (t: ThemeMode) => {
        setThemeState(t);
        localStorage.setItem("theme", t);
      },
    }),
    [theme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
