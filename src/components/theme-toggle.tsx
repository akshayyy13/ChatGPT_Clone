"use client";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="inline-flex items-center gap-1 bg-white/10 dark:bg-white/10 rounded-full p-1">
      <button
        onClick={() => setTheme("light")}
        className={`px-3 py-1.5 rounded-full text-sm ${
          theme === "light" ? "bg-white text-black" : "hover:bg-white/15"
        }`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`px-3 py-1.5 rounded-full text-sm ${
          theme === "dark" ? "bg-white text-black" : "hover:bg-white/15"
        }`}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`px-3 py-1.5 rounded-full text-sm ${
          theme === "system" ? "bg-white text-black" : "hover:bg-white/15"
        }`}
      >
        System
      </button>
    </div>
  );
}
