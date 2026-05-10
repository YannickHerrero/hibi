import { sessions } from "@hibi/db/schema";
import {
  CreateSessionInputSchema,
  ListSessionsQuerySchema,
  PaginatedSchema,
  SessionSchema,
} from "@hibi/types";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import { getDb } from "../db.ts";
import { apiKeyAuth } from "../middleware/api-key.ts";

const sessionsApp = new OpenAPIHono<{
  Variables: { auth: { userId: string; apiKeyId: string } };
}>();

sessionsApp.use("*", apiKeyAuth);

const PaginatedSessionSchema = PaginatedSchema(SessionSchema);

sessionsApp.openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: { "application/json": { schema: CreateSessionInputSchema } },
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: SessionSchema } },
        description: "Session created",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const { userId } = c.get("auth");
    const db = getDb();

    const [row] = await db
      .insert(sessions)
      .values({
        userId,
        kind: body.kind,
        source: body.source,
        startedAt: new Date(body.startedAt),
        endedAt: new Date(body.endedAt),
        durationMs: body.durationMs,
        metadata: body.metadata ?? null,
      })
      .returning();
    if (!row) throw new Error("Failed to insert session");

    return c.json(serializeSession(row), 201);
  },
);

sessionsApp.openapi(
  createRoute({
    method: "get",
    path: "/",
    request: { query: ListSessionsQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: PaginatedSessionSchema } },
        description: "List sessions (newest first)",
      },
    },
  }),
  async (c) => {
    const { limit, cursor, kind, source, from, to } = c.req.valid("query");
    const { userId } = c.get("auth");
    const db = getDb();

    const filters: SQL[] = [eq(sessions.userId, userId)];
    if (kind) filters.push(eq(sessions.kind, kind));
    if (source) filters.push(eq(sessions.source, source));
    if (from) filters.push(gte(sessions.startedAt, new Date(from)));
    if (to) filters.push(lt(sessions.startedAt, new Date(to)));
    if (cursor) filters.push(lt(sessions.startedAt, new Date(cursor)));

    const rows = await db
      .select()
      .from(sessions)
      .where(and(...filters))
      .orderBy(desc(sessions.startedAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    const nextCursor = hasMore && last ? last.startedAt.toISOString() : null;

    return c.json({ items: items.map(serializeSession), nextCursor }, 200);
  },
);

function serializeSession(row: typeof sessions.$inferSelect) {
  return {
    ...row,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export { sessionsApp };
