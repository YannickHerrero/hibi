export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--ink)",
        padding: "16px var(--gutter)",
        marginTop: 80,
      }}
    >
      <div
        className="page"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
          padding: 0,
        }}
      >
        <span className="meta">Hibi · v0.0</span>
        <div style={{ display: "flex", gap: 16 }}>
          <a className="meta" href="https://docs.hibi.app" style={{ textDecoration: "none" }}>
            Docs
          </a>
          <a
            className="meta"
            href="https://github.com/YannickHerrero/hibi"
            style={{ textDecoration: "none" }}
          >
            GitHub
          </a>
          <a className="meta" href="https://api.hibi.app/docs" style={{ textDecoration: "none" }}>
            API
          </a>
        </div>
      </div>
    </footer>
  );
}
