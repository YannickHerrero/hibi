import { cardStates, cards } from "@hibi/db/schema";
import { initialState } from "@hibi/fsrs";
import {
  CardSchema,
  CreateCardInputSchema,
  ListCardsQuerySchema,
  PaginatedSchema,
  UpdateCardInputSchema,
  UUIDSchema,
} from "@hibi/types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { SQL } from "drizzle-orm";
import { and, arrayContains, asc, desc, eq, gt, ilike, lt, or } from "drizzle-orm";
import { getDb } from "../db.ts";
import { notFound } from "../lib/errors.ts";
import { apiKeyAuth } from "../middleware/api-key.ts";

const cardsApp = new OpenAPIHono<{
  Variables: { auth: { userId: string; apiKeyId: string } };
}>();

cardsApp.use("*", apiKeyAuth);

const PaginatedCardSchema = PaginatedSchema(CardSchema);

const cardIdParam = z.object({ id: UUIDSchema });

cardsApp.openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: { "application/json": { schema: CreateCardInputSchema } },
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: CardSchema } },
        description: "Card created",
      },
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const { userId } = c.get("auth");
    const db = getDb();

    const card = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(cards)
        .values({ ...body, userId })
        .returning();
      if (!row) throw new Error("Failed to insert card");
      const initial = initialState();
      await tx.insert(cardStates).values({
        cardId: row.id,
        userId,
        due: initial.due,
        stability: initial.stability,
        difficulty: initial.difficulty,
        scheduledDays: initial.scheduledDays,
        learningSteps: initial.learningSteps,
        reps: initial.reps,
        lapses: initial.lapses,
        state: initial.state,
        lastReview: initial.lastReview,
      });
      return row;
    });

    return c.json(serializeCard(card), 201);
  },
);

cardsApp.openapi(
  createRoute({
    method: "get",
    path: "/",
    request: { query: ListCardsQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: PaginatedCardSchema } },
        description: "List cards (newest first)",
      },
    },
  }),
  async (c) => {
    const { limit, cursor, tag, source, q, sort } = c.req.valid("query");
    const { userId } = c.get("auth");
    const db = getDb();

    const cursorDate = cursor ? new Date(cursor) : null;

    const baseFilters = and(
      eq(cards.userId, userId),
      tag ? arrayContains(cards.tags, [tag]) : undefined,
      source ? eq(cards.source, source) : undefined,
      q ? or(ilike(cards.sentence, `%${q}%`), ilike(cards.focusWord, `%${q}%`)) : undefined,
    );

    let cursorFilter: SQL | undefined;
    if (cursorDate) {
      if (sort === "newest") cursorFilter = lt(cards.createdAt, cursorDate);
      else if (sort === "oldest") cursorFilter = gt(cards.createdAt, cursorDate);
      else cursorFilter = gt(cardStates.due, cursorDate);
    }

    const where = and(baseFilters, cursorFilter);

    const orderBy =
      sort === "newest"
        ? desc(cards.createdAt)
        : sort === "oldest"
          ? asc(cards.createdAt)
          : asc(cardStates.due);

    const query =
      sort === "due-soonest"
        ? db
            .select({ card: cards })
            .from(cards)
            .innerJoin(cardStates, eq(cardStates.cardId, cards.id))
            .where(and(where, eq(cardStates.userId, userId)))
            .orderBy(orderBy)
            .limit(limit + 1)
        : db
            .select({ card: cards })
            .from(cards)
            .where(where)
            .orderBy(orderBy)
            .limit(limit + 1);

    const rows = (await query).map((r) => r.card);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];

    let nextCursor: string | null = null;
    if (hasMore && last) {
      if (sort === "due-soonest") {
        // Re-fetch the cardState row for the last card to get its due timestamp
        const [state] = await db
          .select({ due: cardStates.due })
          .from(cardStates)
          .where(and(eq(cardStates.cardId, last.id), eq(cardStates.userId, userId)))
          .limit(1);
        nextCursor = state ? state.due.toISOString() : null;
      } else {
        nextCursor = last.createdAt.toISOString();
      }
    }

    return c.json({ items: items.map(serializeCard), nextCursor }, 200);
  },
);

cardsApp.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    request: { params: cardIdParam },
    responses: {
      200: {
        content: { "application/json": { schema: CardSchema } },
        description: "Card",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { userId } = c.get("auth");
    const db = getDb();

    const [row] = await db
      .select()
      .from(cards)
      .where(and(eq(cards.id, id), eq(cards.userId, userId)))
      .limit(1);

    if (!row) throw notFound();
    return c.json(serializeCard(row), 200);
  },
);

cardsApp.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    request: {
      params: cardIdParam,
      body: { content: { "application/json": { schema: UpdateCardInputSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: CardSchema } },
        description: "Updated card",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const { userId } = c.get("auth");
    const db = getDb();

    const [row] = await db
      .update(cards)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(cards.id, id), eq(cards.userId, userId)))
      .returning();

    if (!row) throw notFound();
    return c.json(serializeCard(row), 200);
  },
);

cardsApp.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    request: { params: cardIdParam },
    responses: { 204: { description: "Deleted" } },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { userId } = c.get("auth");
    const db = getDb();

    const [row] = await db
      .delete(cards)
      .where(and(eq(cards.id, id), eq(cards.userId, userId)))
      .returning({ id: cards.id });

    if (!row) throw notFound();
    return c.body(null, 204);
  },
);

function serializeCard(row: typeof cards.$inferSelect) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    imageUrl: null,
    audioUrl: null,
  };
}

export { cardsApp };
