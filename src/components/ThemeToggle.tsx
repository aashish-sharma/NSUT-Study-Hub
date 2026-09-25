import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-[var(--radius-base)] hover:bg-[var(--color-border)] hover-opacity transition-[background-color] duration-[150ms] text-[var(--color-muted)] hover:text-[var(--color-text)] flex items-center justify-center min-w-[44px] min-h-[44px]"
      aria-label="Toggle theme"
    >
      {theme === "light" && <Sun size={20} strokeWidth={1.75} />}
      {theme === "dark" && <Moon size={20} strokeWidth={1.75} />}
      {theme === "system" && <Monitor size={20} strokeWidth={1.75} />}
    </button>
  );
}
