const TOKENS: { name: string; varName: string }[] = [
  { name: "Paper", varName: "--paper" },
  { name: "Paper alt", varName: "--paper-alt" },
  { name: "Ink", varName: "--ink" },
  { name: "Ink soft", varName: "--ink-soft" },
  { name: "Ink faint", varName: "--ink-faint" },
  { name: "Accent", varName: "--accent" },
  { name: "Accent soft", varName: "--accent-soft" },
  { name: "Muted", varName: "--muted" },
];

export function ColorsSection() {
  return (
    <section className="block">
      <div className="section-title">
        <span className="display">Color tokens</span>
        <span className="meta">Per-theme</span>
      </div>

      <div className="grid-4">
        {TOKENS.map((t) => (
          <div key={t.varName} className="swatch">
            <div className="chip" style={{ background: `var(${t.varName})` }} />
            <div className="meta-row">
              <span className="meta">{t.name}</span>
              <span className="mono" style={{ fontSize: 11 }}>
                {t.varName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
