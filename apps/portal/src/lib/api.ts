import { getSupabase } from "./supabase.ts";

const DEFAULT_BASE_URL = "http://localhost:3000";

function baseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

async function authHeader(): Promise<string> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("No active session");
  return `Bearer ${token}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", await authHeader());
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${baseUrl()}${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && typeof body.error === "object"
        ? (body.error as { message?: string }).message
        : null) ?? `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return body as T;
}
