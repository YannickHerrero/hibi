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

describe("app", () => {
  it("serves the OpenAPI document", async () => {
    const { app } = await import("./app.ts");
    const res = await app.request("/openapi.json");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { openapi: string; info: { title: string } };
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Hibi API");
  });

  it("rejects unauthenticated requests to /v1/cards", async () => {
    const { app } = await import("./app.ts");
    const res = await app.request("/v1/cards");
    expect(res.status).toBe(401);
  });

  it("rejects malformed Bearer tokens on /v1/cards", async () => {
    const { app } = await import("./app.ts");
    const res = await app.request("/v1/cards", {
      headers: { Authorization: "Bearer not-an-api-key" },
    });
    expect(res.status).toBe(401);
  });

  it("redirects /docs and serves the Scalar UI", async () => {
    const { app } = await import("./app.ts");
    const res = await app.request("/docs");
    expect([200, 301, 302]).toContain(res.status);
  });
});
