import { randomBytes } from "node:crypto";
import { Algorithm, hash, verify } from "@node-rs/argon2";
import { getEnv } from "../env.ts";

const KEY_PREFIX = "hibi_";

export function generateApiKey(): string {
  const bytes = randomBytes(32);
  return KEY_PREFIX + bytes.toString("base64url");
}

export async function hashApiKey(rawKey: string): Promise<string> {
  return hash(rawKey, {
    algorithm: Algorithm.Argon2id,
    secret: Buffer.from(getEnv().API_KEY_PEPPER),
  });
}

export async function verifyApiKey(rawKey: string, storedHash: string): Promise<boolean> {
  return verify(storedHash, rawKey, {
    secret: Buffer.from(getEnv().API_KEY_PEPPER),
  });
}

export function isApiKeyShape(token: string): boolean {
  return token.startsWith(KEY_PREFIX);
}
