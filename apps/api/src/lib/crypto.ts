import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getEnv } from "../env.ts";

const KEY_PREFIX = "hibi_";

export function generateApiKey(): string {
  const bytes = randomBytes(32);
  return KEY_PREFIX + bytes.toString("base64url");
}

export function hashApiKey(rawKey: string): string {
  return createHmac("sha256", getEnv().API_KEY_PEPPER).update(rawKey).digest("hex");
}

export function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function isApiKeyShape(token: string): boolean {
  return token.startsWith(KEY_PREFIX);
}
