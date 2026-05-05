import { THEME_SWATCHES, THEMES, type ThemeName } from "../lib/theme.ts";

interface Props {
  theme: ThemeName;
  onChange: (next: ThemeName) => void;
}

export function ThemeBar({ theme, onChange }: Props) {
  return (
    <div className="theme-bar">
      <div className="theme-bar-inner">
        <span className="meta">Hibi · Design System · v1.0</span>
        <div className="theme-pills" role="group" aria-label="Theme">
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
        </div>
      </div>
    </div>
  );
}
