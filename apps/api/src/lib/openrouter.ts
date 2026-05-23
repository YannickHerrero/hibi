import { openrouterCredentials } from "@hibi/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db.ts";
import { decryptSecret } from "./crypto.ts";
import { badGateway, badRequest, preconditionRequired } from "./errors.ts";

export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

const DEFAULT_REFERER = "https://hibi.app";
const DEFAULT_TITLE = "Hibi";

export function buildOpenRouterHeaders(
  apiKey: string,
  extra?: { contentType?: string; title?: string; referer?: string },
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": extra?.referer ?? DEFAULT_REFERER,
    "X-Title": extra?.title ?? DEFAULT_TITLE,
  };
  if (extra?.contentType) headers["Content-Type"] = extra.contentType;
  return headers;
}

export interface OpenRouterKeyInfo {
  label: string;
  usage: number | null;
  limit: number | null;
}

/**
 * Probe an OpenRouter API key by calling /auth/key. Returns the public
 * info (label/usage/limit) on success. Throws badRequest on 401/403 and
 * badGateway for other upstream failures.
 */
export async function probeOpenRouterKey(apiKey: string): Promise<OpenRouterKeyInfo> {
  let res: Response;
  try {
    res = await fetch(`${OPENROUTER_BASE}/auth/key`, {
      method: "GET",
      headers: buildOpenRouterHeaders(apiKey),
    });
  } catch (cause) {
    throw badGateway(`OpenRouter unreachable: ${(cause as Error).message}`);
  }

  if (res.status === 401 || res.status === 403) {
    throw badRequest("OpenRouter rejected the API key");
  }
  if (!res.ok) {
    throw badGateway(`OpenRouter probe failed with status ${res.status}`);
  }

  const body = (await res.json()) as {
    data?: { label?: string; usage?: number | null; limit?: number | null };
  };
  const data = body.data;
  if (!data?.label) {
    throw badGateway("OpenRouter probe returned unexpected shape");
  }
  return {
    label: data.label,
    usage: data.usage ?? null,
    limit: data.limit ?? null,
  };
}

/**
 * Fetch and decrypt the stored OpenRouter key for a user. Throws
 * preconditionRequired (428) if the user hasn't set one up.
 */
export async function getStoredOpenRouterKey(userId: string): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select({ encryptedKey: openrouterCredentials.encryptedKey })
    .from(openrouterCredentials)
    .where(eq(openrouterCredentials.userId, userId))
    .limit(1);

  if (!row) {
    throw preconditionRequired("OpenRouter API key not configured for this account");
  }
  return decryptSecret(row.encryptedKey);
}
