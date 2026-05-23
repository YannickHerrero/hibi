import { afterAll, beforeAll, describe, expect, it } from "vitest";

const TEST_ENV = {
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
  API_KEY_PEPPER: "x".repeat(32),
  OPENROUTER_ENCRYPTION_KEY: Buffer.alloc(32, 0xab).toString("base64"),
  PORTAL_URL: "http://localhost:5173",
  NODE_ENV: "test" as const,
};

const originalEnv: Record<string, string | undefined> = {};

beforeAll(() => {
  for (const [key, value] of Object.entries(TEST_ENV)) {
    originalEnv[key] = process.env[key];
    process.env[key] = value;
  }
});

afterAll(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("encryptSecret / decryptSecret", () => {
  it("round-trips a plaintext string", async () => {
    const { encryptSecret, decryptSecret } = await import("./crypto.ts");
    const plaintext = "sk-or-v1-deadbeef".repeat(4);
    const blob = encryptSecret(plaintext);
    expect(blob).not.toContain(plaintext);
    expect(decryptSecret(blob)).toBe(plaintext);
  });

  it("produces a different ciphertext each call (random IV)", async () => {
    const { encryptSecret } = await import("./crypto.ts");
    expect(encryptSecret("hello")).not.toBe(encryptSecret("hello"));
  });

  it("rejects a tampered ciphertext", async () => {
    const { encryptSecret, decryptSecret, SecretDecryptionError } = await import("./crypto.ts");
    const blob = encryptSecret("secret");
    const tampered = `${blob.slice(0, -2)}AA`;
    expect(() => decryptSecret(tampered)).toThrow(SecretDecryptionError);
  });

  it("rejects a blob that's too short", async () => {
    const { decryptSecret, SecretDecryptionError } = await import("./crypto.ts");
    expect(() => decryptSecret("AAAA")).toThrow(SecretDecryptionError);
  });
});
