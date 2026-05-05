import { useState } from "react";

export function ButtonsSection() {
  const [active, setActive] = useState<"all" | "due" | "new">("all");

  return (
    <section className="block">
      <div className="section-title">
        <span className="display">Buttons</span>
        <span className="meta">Primary · Ghost · Segment</span>
      </div>

      <div className="grid-3">
        <div>
          <div className="meta">.btn-primary</div>
          <button type="button" className="btn-primary" style={{ marginTop: 10 }}>
            Submit review
          </button>
        </div>
        <div>
          <div className="meta">.btn-ghost</div>
          <button type="button" className="btn-ghost" style={{ marginTop: 10 }}>
            Cancel
          </button>
        </div>
        <div>
          <div className="meta">.btn-segment</div>
          <div className="btn-segment" style={{ marginTop: 10 }}>
            {(["all", "due", "new"] as const).map((id) => (
              <button
                type="button"
                key={id}
                className={active === id ? "active" : undefined}
                onClick={() => setActive(id)}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
