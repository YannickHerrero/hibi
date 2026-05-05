export function TypographySection() {
  return (
    <section className="block">
      <div className="section-title">
        <span className="display">Typography</span>
        <span className="meta">Newsreader · Geist · Geist Mono</span>
      </div>

      <div className="grid-2">
        <div>
          <div className="meta">Display · Newsreader</div>
          <div className="display" style={{ fontSize: 96 }}>
            Hibi
          </div>
          <div className="display italic" style={{ fontSize: 44 }}>
            day by day
          </div>
        </div>

        <div>
          <div className="meta">Body · Geist Sans</div>
          <p className="sans" style={{ fontSize: "var(--t-body)", marginTop: 8 }}>
            The body sets readings in Geist at 17/26. Mining clients render furigana with native
            ruby on web and a custom layout on mobile.
          </p>
        </div>
      </div>

      <div className="rule-soft" style={{ margin: "24px 0" }} />

      <div className="meta">Mono · Geist Mono</div>
      <div className="mono" style={{ fontSize: "var(--t-mono-md)", marginTop: 6 }}>
        --paper / --ink / --accent · 0.18em tracking
      </div>
    </section>
  );
}
