"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="app-border flex h-9 w-9 items-center justify-center rounded-full border transition hover:border-[var(--color-primary-light)]"
    >
      {mounted ? (
        isDark ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4 text-primary" />
      ) : (
        <Sun className="h-4 w-4 opacity-0" />
      )}
    </button>
  );
}
