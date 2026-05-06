import { type FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase.ts";

type Step = "email" | "code";

export function Login() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/stats";

  if (!isSupabaseConfigured()) {
    return (
      <section className="block">
        <h1 className="display" style={{ fontSize: 44 }}>
          Sign in
        </h1>
        <p className="serif" style={{ marginTop: 16, color: "var(--accent)" }}>
          Supabase isn't configured for this build.
        </p>
        <p className="sans" style={{ marginTop: 8, color: "var(--ink-soft)" }}>
          Set <code className="mono">VITE_SUPABASE_URL</code> and{" "}
          <code className="mono">VITE_SUPABASE_ANON_KEY</code> in <code className="mono">.env</code>{" "}
          before running <code className="mono">pnpm dev</code>.
        </p>
      </section>
    );
  }

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await getSupabase().auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (err) throw err;
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await getSupabase().auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (err) throw err;
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="block" style={{ maxWidth: 480 }}>
      <div className="meta">{step === "email" ? "Step 1 of 2" : "Step 2 of 2"}</div>
      <h1 className="display" style={{ fontSize: 44, marginTop: 8 }}>
        Sign in
      </h1>

      {step === "email" ? (
        <form onSubmit={sendCode} style={{ marginTop: 24 }}>
          <p className="serif" style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
            Enter your email — we'll send a 6-digit code. No passwords.
          </p>
          <div className="field">
            <div className="meta" style={{ marginBottom: 4 }}>
              Email
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div style={{ marginTop: 24 }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !email}
              style={{ opacity: submitting || !email ? 0.5 : 1 }}
            >
              {submitting ? "Sending..." : "Send code"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyCode} style={{ marginTop: 24 }}>
          <p className="serif" style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
            We sent a code to <strong>{email}</strong>.
          </p>
          <div className="field">
            <div className="meta" style={{ marginBottom: 4 }}>
              Code
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="123456"
              required
              autoComplete="one-time-code"
              style={{ letterSpacing: "0.4em" }}
            />
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || code.length < 6}
              style={{ opacity: submitting || code.length < 6 ? 0.5 : 1 }}
            >
              {submitting ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              disabled={submitting}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {error && (
        <p
          className="meta"
          role="alert"
          style={{ marginTop: 16, color: "var(--accent)", textTransform: "none", letterSpacing: 0 }}
        >
          {error}
        </p>
      )}
    </section>
  );
}
