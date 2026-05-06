import type { ApiKey } from "@hibi/types";
import { type FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../lib/api.ts";

interface KeysResponse {
  items: ApiKey[];
}

interface CreateResponse {
  apiKey: ApiKey;
  rawKey: string;
}

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<{ name: string; raw: string } | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<KeysResponse>("/v1/account/keys")
      .then((res) => {
        if (active) setKeys(res.items);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load keys.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function createKey(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await apiFetch<CreateResponse>("/v1/account/keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setRevealedKey({ name: res.apiKey.name, raw: res.rawKey });
      setKeys((prev) => (prev ? [res.apiKey, ...prev] : [res.apiKey]));
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create key.");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    setRevokingId(id);
    setError(null);
    try {
      await apiFetch<void>(`/v1/account/keys/${id}`, { method: "DELETE" });
      setKeys((prev) =>
        prev
          ? prev.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k))
          : prev,
      );
      setConfirmRevoke(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke key.");
    } finally {
      setRevokingId(null);
    }
  }

  async function copyRaw() {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey.raw);
  }

  return (
    <div>
      <div className="section-title">
        <span className="display" style={{ fontSize: 24 }}>
          API keys
        </span>
        <span className="meta">For Kiseki, Horu, Tsumu</span>
      </div>

      <p className="sans" style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
        Mining and review clients authenticate with an API key per device. Keys are hashed at rest —
        the raw value is shown <strong>once</strong> at creation.
      </p>

      {revealedKey && (
        <div
          role="alert"
          style={{
            border: "1px solid var(--accent)",
            background: "var(--paper-alt)",
            padding: 16,
            marginBottom: 24,
          }}
        >
          <div className="meta" style={{ color: "var(--accent)" }}>
            New key — copy it now
          </div>
          <p className="sans" style={{ marginTop: 6, marginBottom: 12 }}>
            <strong>{revealedKey.name}</strong> won't be shown again. Store it somewhere safe.
          </p>
          <code
            className="mono"
            style={{
              display: "block",
              padding: 10,
              background: "var(--paper)",
              border: "1px solid var(--ink)",
              fontSize: 12,
              wordBreak: "break-all",
            }}
          >
            {revealedKey.raw}
          </code>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="button" className="btn-primary" onClick={copyRaw}>
              Copy
            </button>
            <button type="button" className="btn-ghost" onClick={() => setRevealedKey(null)}>
              I've saved it
            </button>
          </div>
        </div>
      )}

      <form onSubmit={createKey} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 1 }}>
          <div className="meta" style={{ marginBottom: 4 }}>
            Name
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kiseki iOS"
            maxLength={80}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={creating || !name.trim()}
          style={{ opacity: creating || !name.trim() ? 0.5 : 1 }}
        >
          {creating ? "Creating..." : "Create key"}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <p className="meta">Loading…</p>
        ) : keys && keys.length > 0 ? (
          <table className="tokens">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Last used</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const revoked = !!k.revokedAt;
                return (
                  <tr key={k.id} style={{ opacity: revoked ? 0.55 : 1 }}>
                    <td>{k.name}</td>
                    <td>{formatDate(k.createdAt)}</td>
                    <td>{k.lastUsedAt ? formatDate(k.lastUsedAt) : "—"}</td>
                    <td style={{ textAlign: "right" }}>
                      {revoked ? (
                        <span className="meta">Revoked</span>
                      ) : confirmRevoke === k.id ? (
                        <span style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => revoke(k.id)}
                            disabled={revokingId === k.id}
                            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                          >
                            {revokingId === k.id ? "Revoking…" : "Confirm"}
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => setConfirmRevoke(null)}
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => setConfirmRevoke(k.id)}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="meta">No keys yet. Create one above to authenticate a client.</p>
        )}
      </div>

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
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
