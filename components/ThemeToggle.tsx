"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md group flex items-center justify-center cursor-pointer"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
        <Sun
          className={`absolute text-amber-500 ease-in-out ${
            theme === "dark"
              ? "opacity-0 rotate-90 scale-50"
              : "opacity-100 rotate-0 scale-100"
          }`}
          size={20}
          strokeWidth={2.5}
        />
        <Moon
          className={`absolute text-indigo-400 ease-in-out ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-50"
          }`}
          size={20}
          strokeWidth={2.5}
        />
      </div>
    </button>
  );
}
