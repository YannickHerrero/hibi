import { openrouterCredentials } from "@hibi/db/schema";
import {
  OpenRouterKeyInfoSchema,
  OpenRouterKeyStatusSchema,
  SaveOpenRouterKeyInputSchema,
} from "@hibi/types";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { getDb } from "../db.ts";
import { encryptSecret } from "../lib/crypto.ts";
import { probeOpenRouterKey } from "../lib/openrouter.ts";
import { supabaseAuth } from "../middleware/supabase-auth.ts";

const accountOpenRouterApp = new OpenAPIHono<{
  Variables: { auth: { userId: string; email: string } };
}>();

accountOpenRouterApp.use("*", supabaseAuth);

accountOpenRouterApp.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: { "application/json": { schema: OpenRouterKeyStatusSchema } },
        description: "Whether an OpenRouter key is stored for this account",
      },
    },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const db = getDb();
    const [row] = await db
      .select({
        keyLabel: openrouterCredentials.keyLabel,
        updatedAt: openrouterCredentials.updatedAt,
      })
      .from(openrouterCredentials)
      .where(eq(openrouterCredentials.userId, userId))
      .limit(1);

    if (!row) return c.json({ configured: false }, 200);
    return c.json(
      {
        configured: true,
        keyLabel: row.keyLabel ?? null,
        updatedAt: row.updatedAt.toISOString(),
      },
      200,
    );
  },
);

accountOpenRouterApp.openapi(
  createRoute({
    method: "put",
    path: "/",
    request: {
      body: { content: { "application/json": { schema: SaveOpenRouterKeyInputSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: OpenRouterKeyInfoSchema } },
        description: "Validated and stored. Returns the OpenRouter key info.",
      },
    },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const { apiKey } = c.req.valid("json");

    const info = await probeOpenRouterKey(apiKey);
    const encrypted = encryptSecret(apiKey);
    const db = getDb();

    await db
      .insert(openrouterCredentials)
      .values({
        userId,
        encryptedKey: encrypted,
        keyLabel: info.label,
      })
      .onConflictDoUpdate({
        target: openrouterCredentials.userId,
        set: {
          encryptedKey: encrypted,
          keyLabel: info.label,
          updatedAt: new Date(),
        },
      });

    return c.json(info, 200);
  },
);

accountOpenRouterApp.openapi(
  createRoute({
    method: "delete",
    path: "/",
    responses: { 204: { description: "Removed" } },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const db = getDb();
    await db.delete(openrouterCredentials).where(eq(openrouterCredentials.userId, userId));
    return c.body(null, 204);
  },
);

export { accountOpenRouterApp };
