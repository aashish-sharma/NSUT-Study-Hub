import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.setAttribute("data-theme", isDark ? "dark" : "light");
    if (theme !== "system") {
      localStorage.setItem("theme", theme);
    } else {
      localStorage.removeItem("theme");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => {
      if (current === "light") return "dark";
      if (current === "dark") return "system";
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark";
    });
  };

  return { theme, toggleTheme };
}
