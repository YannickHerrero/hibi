import { useEffect, useState } from "react";

export type ThemeName = "paper" | "stone" | "sage" | "clay" | "ink";

export const THEMES: ThemeName[] = ["paper", "stone", "sage", "clay", "ink"];

export const THEME_SWATCHES: Record<ThemeName, [string, string, string]> = {
  paper: ["#F4EBD9", "#2B241B", "#B5593A"],
  stone: ["#E6E8EA", "#2D3338", "#4A6B8A"],
  sage: ["#DDE4D2", "#2C3526", "#3F5C32"],
  clay: ["#E8D4C2", "#3A2820", "#9E4521"],
  ink: ["#000000", "#E4E1D8", "#F5EFE0"],
};

const STORAGE_KEY = "hibi.design.theme";

function readInitialTheme(): ThemeName {
  if (typeof document === "undefined") return "paper";
  const fromAttr = document.documentElement.dataset["theme"] as ThemeName | undefined;
  if (fromAttr && THEMES.includes(fromAttr)) return fromAttr;
  const fromStorage = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  if (fromStorage && THEMES.includes(fromStorage)) return fromStorage;
  return "paper";
}

export function useTheme(): [ThemeName, (next: ThemeName) => void] {
  const [theme, setTheme] = useState<ThemeName>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}
