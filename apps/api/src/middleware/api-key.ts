import { apiKeys } from "@hibi/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { getDb } from "../db.ts";
import { hashApiKey, isApiKeyShape } from "../lib/crypto.ts";
import { unauthorized } from "../lib/errors.ts";

export interface ApiKeyContext {
  userId: string;
  apiKeyId: string;
}

export const apiKeyAuth = createMiddleware<{
  Variables: { auth: ApiKeyContext };
}>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw unauthorized("Missing Bearer token");
  }

  const token = header.slice("Bearer ".length).trim();
  if (!isApiKeyShape(token)) {
    throw unauthorized("Invalid API key format");
  }

  const keyHash = hashApiKey(token);
  const db = getDb();
  const [row] = await db
    .select({ id: apiKeys.id, userId: apiKeys.userId })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!row) {
    throw unauthorized("Invalid API key");
  }

  c.set("auth", { userId: row.userId, apiKeyId: row.id });
  await next();
});
