import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "../env.ts";

// Single private bucket holds every user's mining media. Reads happen
// through short-lived signed URLs; writes are server-side only via the
// service role.
export const MEDIA_BUCKET = "hibi-media";

let cachedClient: SupabaseClient | null = null;

function getStorageClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const env = getEnv();
  cachedClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export type UploadResult = { key: string };

// Uploads `body` to `path` inside the media bucket. The path is the
// returned `key` and is what gets stored in cards.audioKey / imageKey.
export async function uploadMedia(
  path: string,
  body: ArrayBuffer | Blob,
  contentType: string,
): Promise<UploadResult> {
  const client = getStorageClient();
  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`storage upload failed: ${error.message}`);
  return { key: path };
}

// Issues a signed URL for the given key. Used by future read paths
// (Hibi portal/playback). Default TTL: 1 hour.
export async function signedMediaUrl(key: string, expiresInSec = 3600): Promise<string> {
  const client = getStorageClient();
  const { data, error } = await client.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(key, expiresInSec);
  if (error || !data) throw new Error(`signed url failed: ${error?.message ?? "unknown"}`);
  return data.signedUrl;
}

// Bulk variant: signs many keys in a single round-trip and returns a
// path → signedUrl map. Keys missing from the result map either failed
// to sign (not found, etc.) and should be treated as null by callers.
export async function signedMediaUrls(
  keys: string[],
  expiresInSec = 3600,
): Promise<Map<string, string>> {
  if (keys.length === 0) return new Map();
  const client = getStorageClient();
  const { data, error } = await client.storage
    .from(MEDIA_BUCKET)
    .createSignedUrls(keys, expiresInSec);
  if (error || !data) throw new Error(`signed urls failed: ${error?.message ?? "unknown"}`);
  const map = new Map<string, string>();
  for (const item of data) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}
