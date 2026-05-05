export function FieldsSection() {
  return (
    <section className="block">
      <div className="section-title">
        <span className="display">Form fields</span>
        <span className="meta">Editorial · serif input</span>
      </div>

      <div className="grid-2">
        <div>
          <div className="meta">.field</div>
          <div className="field" style={{ marginTop: 10 }}>
            <input placeholder="Search cards..." />
          </div>
        </div>
        <div>
          <div className="meta">.field with label</div>
          <div className="field" style={{ marginTop: 10 }}>
            <div className="meta" style={{ marginBottom: 4 }}>
              Email
            </div>
            <input type="email" placeholder="you@example.com" />
          </div>
        </div>
      </div>
    </section>
  );
}
