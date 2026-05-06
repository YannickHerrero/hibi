import { useNavigate } from "react-router-dom";
import { ApiKeysSection } from "../components/ApiKeysSection.tsx";
import { useAuth } from "../lib/auth.tsx";
import { getSupabase } from "../lib/supabase.ts";
import { THEME_SWATCHES, THEMES, useTheme } from "../lib/theme.ts";

export function Account() {
  const { session } = useAuth();
  const [theme, setTheme] = useTheme();
  const navigate = useNavigate();

  async function signOut() {
    await getSupabase().auth.signOut();
    navigate("/", { replace: true });
  }

  if (!session) return null;
  const memberSince = session.user.created_at
    ? new Date(session.user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <section className="block">
      <h1 className="display" style={{ fontSize: 44 }}>
        Account
      </h1>

      <div className="rule" style={{ margin: "32px 0 24px" }} />

      <div className="section-title">
        <span className="display" style={{ fontSize: 24 }}>
          Profile
        </span>
        <span className="meta">Read-only</span>
      </div>
      <div className="kv" style={{ maxWidth: 520 }}>
        <span className="k">Email</span>
        <span className="v">{session.user.email ?? "—"}</span>
        <span className="k">Member since</span>
        <span className="v">{memberSince}</span>
        <span className="k">User ID</span>
        <span className="v" style={{ wordBreak: "break-all" }}>
          {session.user.id}
        </span>
      </div>
      <div style={{ marginTop: 24 }}>
        <button type="button" className="btn-ghost" onClick={signOut}>
          Sign out
        </button>
      </div>

      <div className="rule-soft" style={{ margin: "48px 0 24px" }} />

      <div className="section-title">
        <span className="display" style={{ fontSize: 24 }}>
          Theme
        </span>
        <span className="meta">5 Torakaa variants</span>
      </div>
      <p className="sans" style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
        Switch themes — your choice persists in this browser. Server-side preference is on the
        roadmap.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {THEMES.map((name) => {
          const [paper, ink, accent] = THEME_SWATCHES[name];
          const active = theme === name;
          return (
            <button
              type="button"
              key={name}
              onClick={() => setTheme(name)}
              aria-pressed={active}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                border: "1px solid var(--ink)",
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--paper)" : "var(--ink)",
                cursor: "pointer",
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "flex",
                  width: 28,
                  height: 16,
                  border: `1px solid ${active ? "var(--paper)" : "var(--ink)"}`,
                }}
              >
                <span style={{ flex: 2, background: paper }} />
                <span style={{ flex: 1, background: ink }} />
                <span style={{ flex: 1, background: accent }} />
              </span>
              {name}
            </button>
          );
        })}
      </div>

      <div className="rule-soft" style={{ margin: "48px 0 24px" }} />

      <ApiKeysSection />

      <div className="rule-soft" style={{ margin: "48px 0 24px" }} />

      <div className="section-title">
        <span className="display" style={{ fontSize: 24, color: "var(--accent)" }}>
          Danger zone
        </span>
        <span className="meta">Coming soon</span>
      </div>
      <p className="sans" style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
        Account deletion will live here. It will revoke all API keys, delete every card and review,
        and remove the Supabase user.
      </p>
      <button
        type="button"
        className="btn-ghost"
        disabled
        style={{ opacity: 0.5, cursor: "not-allowed" }}
      >
        Delete account
      </button>
    </section>
  );
}
