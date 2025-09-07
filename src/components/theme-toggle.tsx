"use client";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="inline-flex items-center gap-1 bg-[#f9f9f9]/10 dark:bg-[#f9f9f9]/10 rounded-full p-1">
      <button
        onClick={() => setTheme("light")}
        className={`px-3 py-1.5 rounded-full text-sm ${
          theme === "light" ? "bg-[#f9f9f9] text-black" : "hover:bg-[#f9f9f9]/15"
        }`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`px-3 py-1.5 rounded-full text-sm ${
          theme === "dark" ? "bg-[#f9f9f9] text-black" : "hover:bg-[#f9f9f9]/15"
        }`}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`px-3 py-1.5 rounded-full text-sm ${
          theme === "system" ? "bg-[#f9f9f9] text-black" : "hover:bg-[#f9f9f9]/15"
        }`}
      >
        System
      </button>
    </div>
  );
}
