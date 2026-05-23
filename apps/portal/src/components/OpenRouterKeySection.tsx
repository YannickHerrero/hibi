import type { OpenRouterKeyInfo, OpenRouterKeyStatus } from "@hibi/types";
import { type FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../lib/api.ts";

export function OpenRouterKeySection() {
  const [status, setStatus] = useState<OpenRouterKeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<OpenRouterKeyStatus>("/v1/account/openrouter-key")
      .then((res) => {
        if (active) setStatus(res);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load status.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const info = await apiFetch<OpenRouterKeyInfo>("/v1/account/openrouter-key", {
        method: "PUT",
        body: JSON.stringify({ apiKey: input.trim() }),
      });
      setStatus({
        configured: true,
        keyLabel: info.label,
        updatedAt: new Date().toISOString(),
      });
      setInput("");
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save key.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setRemoving(true);
    setError(null);
    try {
      await apiFetch<void>("/v1/account/openrouter-key", { method: "DELETE" });
      setStatus({ configured: false });
      setConfirmRemove(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove key.");
    } finally {
      setRemoving(false);
    }
  }

  const configured = status?.configured === true;

  return (
    <div>
      <div className="section-title">
        <span className="display" style={{ fontSize: 24 }}>
          OpenRouter
        </span>
        <span className="meta">Used by Toru, Koe, Yomi</span>
      </div>

      <p className="sans" style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
        Set your OpenRouter key once here and it works across every Hibi client. The raw key is
        encrypted on the Hibi server and never sent back to any device.{" "}
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--accent)" }}
        >
          Generate one on openrouter.ai →
        </a>
      </p>

      {loading ? (
        <p className="meta">Loading…</p>
      ) : configured && !editing ? (
        <div className="kv" style={{ maxWidth: 520 }}>
          <span className="k">Status</span>
          <span className="v">Configured</span>
          <span className="k">Label</span>
          <span className="v">{status?.keyLabel ?? "—"}</span>
          <span className="k">Updated</span>
          <span className="v">{status?.updatedAt ? formatDate(status.updatedAt) : "—"}</span>
          <span className="k">Actions</span>
          <span className="v" style={{ display: "inline-flex", gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={() => setEditing(true)}>
              Replace
            </button>
            {confirmRemove ? (
              <>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={remove}
                  disabled={removing}
                  style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                >
                  {removing ? "Removing…" : "Confirm remove"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setConfirmRemove(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="btn-ghost" onClick={() => setConfirmRemove(true)}>
                Remove
              </button>
            )}
          </span>
        </div>
      ) : (
        <form onSubmit={save} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1 }}>
            <div className="meta" style={{ marginBottom: 4 }}>
              OpenRouter API key
            </div>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="sk-or-v1-…"
              autoComplete="off"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || !input.trim()}
            style={{ opacity: saving || !input.trim() ? 0.5 : 1 }}
          >
            {saving ? "Validating…" : configured ? "Replace" : "Save"}
          </button>
          {editing && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setEditing(false);
                setInput("");
              }}
            >
              Cancel
            </button>
          )}
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
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
