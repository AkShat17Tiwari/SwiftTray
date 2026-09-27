"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type ColorTheme = "light" | "dark";

const THEME_STORAGE_KEY = "swifttray-theme";
const themeListeners = new Set<() => void>();

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    themeListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getThemeSnapshot(): ColorTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: ColorTheme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  themeListeners.forEach((listener) => listener());
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light"
  );
  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = `Switch to ${nextTheme} mode`;

  return (
    <button
      type="button"
      onClick={() => applyTheme(nextTheme)}
      aria-label={label}
      title={label}
      className={`theme-toggle min-h-11 rounded-xl neu-btn text-foreground flex items-center justify-center gap-2 transition-colors ${
        compact ? "w-11 px-0" : "w-full px-3"
      }`}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      {!compact && (
        <span className="text-xs font-semibold">
          {isDark ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
