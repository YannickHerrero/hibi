import { cardStates, cards, wordStatuses } from "@hibi/db/schema";
import {
  KnownWordSchema,
  ManualWordStatusSchema,
  PaginatedSchema,
  PaginationQuerySchema,
  SetWordStatusInputSchema,
} from "@hibi/types";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { getDb } from "../db.ts";
import { apiKeyAuth } from "../middleware/api-key.ts";

const wordStatusApp = new OpenAPIHono<{
  Variables: { auth: { userId: string; apiKeyId: string } };
}>();

wordStatusApp.use("*", apiKeyAuth);

const PaginatedManualSchema = PaginatedSchema(ManualWordStatusSchema);
const PaginatedKnownSchema = PaginatedSchema(KnownWordSchema);

// PUT /v1/word-status — upsert (lemma, reading) for the caller.
// Body { status: null } deletes the row.
wordStatusApp.openapi(
  createRoute({
    method: "put",
    path: "/word-status",
    request: {
      body: { content: { "application/json": { schema: SetWordStatusInputSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: ManualWordStatusSchema.nullable() } },
        description: "Upserted manual word status (or null if deleted).",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const { userId } = c.get("auth");
    const db = getDb();

    if (body.status === null) {
      await db
        .delete(wordStatuses)
        .where(
          and(
            eq(wordStatuses.userId, userId),
            eq(wordStatuses.lemma, body.lemma),
            eq(wordStatuses.reading, body.reading),
          ),
        );
      return c.json(null, 200);
    }

    const now = new Date();
    const [row] = await db
      .insert(wordStatuses)
      .values({
        userId,
        lemma: body.lemma,
        reading: body.reading,
        status: body.status,
      })
      .onConflictDoUpdate({
        target: [wordStatuses.userId, wordStatuses.lemma, wordStatuses.reading],
        set: { status: body.status, updatedAt: now },
      })
      .returning();
    if (!row) throw new Error("Failed to upsert word status");
    return c.json(serializeManual(row), 200);
  },
);

// GET /v1/word-status — paginated list of manual rows only.
wordStatusApp.openapi(
  createRoute({
    method: "get",
    path: "/word-status",
    request: { query: PaginationQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: PaginatedManualSchema } },
        description: "Manual word statuses (newest first).",
      },
    },
  }),
  async (c) => {
    const { limit, cursor } = c.req.valid("query");
    const { userId } = c.get("auth");
    const db = getDb();

    const cursorDate = cursor ? new Date(cursor) : null;
    const where = cursorDate
      ? and(eq(wordStatuses.userId, userId), lt(wordStatuses.updatedAt, cursorDate))
      : eq(wordStatuses.userId, userId);

    const rows = await db
      .select()
      .from(wordStatuses)
      .where(where)
      .orderBy(desc(wordStatuses.updatedAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    const nextCursor = hasMore && last ? last.updatedAt.toISOString() : null;
    return c.json({ items: items.map(serializeManual), nextCursor }, 200);
  },
);

// GET /v1/known-words — merged view: manual rows ∪ SRS-derived rows.
// SRS wins on conflict: cards in 'review' with scheduledDays > 14 are
// 'known'; any card in learning/review/relearning otherwise is
// 'learning'. Identity for the union is (focus_word, focus_word_reading);
// see plan note about treating focus_word as the lemma.
wordStatusApp.openapi(
  createRoute({
    method: "get",
    path: "/known-words",
    request: { query: PaginationQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: PaginatedKnownSchema } },
        description: "Merged manual + SRS-derived known/learning/ignored words.",
      },
    },
  }),
  async (c) => {
    const { limit, cursor } = c.req.valid("query");
    const { userId } = c.get("auth");
    const db = getDb();

    // Single CTE: collect candidates from both sources, then dedupe with
    // DISTINCT ON to keep one row per (lemma, reading), preferring SRS.
    const cursorDate = cursor ? new Date(cursor) : null;
    const cursorClause = cursorDate ? sql`WHERE updated_at < ${cursorDate}` : sql``;
    const result = await db.execute<{
      lemma: string;
      reading: string;
      status: string;
      source: string;
      card_id: string | null;
      interval_days: number | null;
      updated_at: Date;
    }>(sql`
      WITH candidates AS (
        SELECT lemma, reading, status, 'manual'::text AS source,
               NULL::uuid AS card_id, NULL::int AS interval_days,
               updated_at
          FROM ${wordStatuses}
         WHERE user_id = ${userId}
        UNION ALL
        SELECT c.focus_word AS lemma,
               c.focus_word_reading AS reading,
               CASE WHEN cs.state = 'review' AND cs.scheduled_days > 14
                    THEN 'known' ELSE 'learning' END AS status,
               'srs'::text AS source,
               c.id AS card_id,
               cs.scheduled_days::int AS interval_days,
               cs.updated_at
          FROM ${cards} c
          JOIN ${cardStates} cs ON cs.card_id = c.id
         WHERE c.user_id = ${userId}
      ),
      deduped AS (
        SELECT DISTINCT ON (lemma, reading)
               lemma, reading, status, source, card_id, interval_days, updated_at
          FROM candidates
         ORDER BY lemma, reading,
                  CASE source WHEN 'srs' THEN 0 ELSE 1 END
      )
      SELECT lemma, reading, status, source, card_id, interval_days, updated_at
        FROM deduped
      ${cursorClause}
       ORDER BY updated_at DESC
       LIMIT ${limit + 1}
    `);

    const rows = result as unknown as Array<{
      lemma: string;
      reading: string;
      status: string;
      source: string;
      card_id: string | null;
      interval_days: number | null;
      updated_at: Date;
    }>;

    const hasMore = rows.length > limit;
    const items = (hasMore ? rows.slice(0, limit) : rows).map((r) => ({
      lemma: r.lemma,
      reading: r.reading,
      status: r.status as "learning" | "known" | "ignored",
      source: r.source as "manual" | "srs",
      cardId: r.card_id,
      intervalDays: r.interval_days,
      updatedAt:
        r.updated_at instanceof Date
          ? r.updated_at.toISOString()
          : new Date(r.updated_at).toISOString(),
    }));
    const last = items[items.length - 1];
    const nextCursor = hasMore && last ? last.updatedAt : null;
    return c.json({ items, nextCursor }, 200);
  },
);

function serializeManual(row: typeof wordStatuses.$inferSelect) {
  return {
    id: row.id,
    lemma: row.lemma,
    reading: row.reading,
    status: row.status as "learning" | "known" | "ignored",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export { wordStatusApp };
