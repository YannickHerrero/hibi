import { apiKeys } from "@hibi/db/schema";
import {
  AccountSchema,
  ApiKeySchema,
  CreateApiKeyInputSchema,
  CreateApiKeyResponseSchema,
  UUIDSchema,
} from "@hibi/types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../db.ts";
import { generateApiKey, hashApiKey } from "../lib/crypto.ts";
import { notFound } from "../lib/errors.ts";
import { supabaseAuth } from "../middleware/supabase-auth.ts";

const accountApp = new OpenAPIHono<{
  Variables: { auth: { userId: string; email: string } };
}>();

accountApp.use("*", supabaseAuth);

accountApp.openapi(
  createRoute({
    method: "get",
    path: "/me",
    responses: {
      200: {
        content: { "application/json": { schema: AccountSchema } },
        description: "Current account",
      },
    },
  }),
  async (c) => {
    const { userId, email } = c.get("auth");
    return c.json({ id: userId, email, createdAt: new Date().toISOString() }, 200);
  },
);

accountApp.openapi(
  createRoute({
    method: "get",
    path: "/keys",
    responses: {
      200: {
        content: { "application/json": { schema: z.object({ items: z.array(ApiKeySchema) }) } },
        description: "API keys for the current account",
      },
    },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const db = getDb();
    const rows = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));

    return c.json(
      {
        items: rows.map((r) => ({
          id: r.id,
          name: r.name,
          lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
          createdAt: r.createdAt.toISOString(),
          revokedAt: r.revokedAt ? r.revokedAt.toISOString() : null,
        })),
      },
      200,
    );
  },
);

accountApp.openapi(
  createRoute({
    method: "post",
    path: "/keys",
    request: {
      body: { content: { "application/json": { schema: CreateApiKeyInputSchema } } },
    },
    responses: {
      201: {
        content: { "application/json": { schema: CreateApiKeyResponseSchema } },
        description: "Created key (rawKey is shown ONCE)",
      },
    },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const { name } = c.req.valid("json");
    const db = getDb();

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    const [row] = await db.insert(apiKeys).values({ userId, name, keyHash }).returning({
      id: apiKeys.id,
      name: apiKeys.name,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    });

    if (!row) throw new Error("Failed to insert api key");

    return c.json(
      {
        apiKey: {
          id: row.id,
          name: row.name,
          lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
          createdAt: row.createdAt.toISOString(),
          revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
        },
        rawKey,
      },
      201,
    );
  },
);

accountApp.openapi(
  createRoute({
    method: "delete",
    path: "/keys/{id}",
    request: { params: z.object({ id: UUIDSchema }) },
    responses: { 204: { description: "Revoked" } },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const { id } = c.req.valid("param");
    const db = getDb();

    const [row] = await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .returning({ id: apiKeys.id });

    if (!row) throw notFound();
    return c.body(null, 204);
  },
);

export { accountApp };
