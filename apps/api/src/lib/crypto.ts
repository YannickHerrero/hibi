import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { getEnv } from "../env.ts";

const KEY_PREFIX = "hibi_";
const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;
const SECRET_KEY_BYTES = 32;

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

export class SecretDecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretDecryptionError";
  }
}

function getSecretKey(): Buffer {
  const key = Buffer.from(getEnv().OPENROUTER_ENCRYPTION_KEY, "base64");
  if (key.length !== SECRET_KEY_BYTES) {
    throw new Error(
      `OPENROUTER_ENCRYPTION_KEY must decode to ${SECRET_KEY_BYTES} bytes (got ${key.length})`,
    );
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(GCM_IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getSecretKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

export function decryptSecret(blob: string): string {
  const buf = Buffer.from(blob, "base64url");
  if (buf.length < GCM_IV_BYTES + GCM_TAG_BYTES) {
    throw new SecretDecryptionError("ciphertext blob too short");
  }
  const iv = buf.subarray(0, GCM_IV_BYTES);
  const tag = buf.subarray(GCM_IV_BYTES, GCM_IV_BYTES + GCM_TAG_BYTES);
  const ciphertext = buf.subarray(GCM_IV_BYTES + GCM_TAG_BYTES);
  const decipher = createDecipheriv("aes-256-gcm", getSecretKey(), iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new SecretDecryptionError("authentication failed (key wrong or ciphertext tampered)");
  }
}
