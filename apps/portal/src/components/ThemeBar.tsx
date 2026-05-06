import { THEMES, THEME_SWATCHES, type ThemeName } from "../lib/theme.ts";

interface Props {
  theme: ThemeName;
  onChange: (next: ThemeName) => void;
}

export function ThemeBar({ theme, onChange }: Props) {
  return (
    <fieldset className="theme-pills" style={{ border: "none", padding: 0, margin: 0 }}>
      <legend style={{ position: "absolute", left: -9999, top: -9999 }}>Theme</legend>
      {THEMES.map((name) => {
        const [paper, ink, accent] = THEME_SWATCHES[name];
        const active = theme === name;
        return (
          <button
            type="button"
            key={name}
            className={active ? "active" : undefined}
            aria-label={`Theme: ${name}`}
            aria-pressed={active}
            onClick={() => onChange(name)}
          >
            <span className="s1" style={{ background: paper }} />
            <span className="s2" style={{ background: ink }} />
            <span className="s3" style={{ background: accent }} />
          </button>
        );
      })}
    </fieldset>
  );
}
