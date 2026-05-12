import { cardStates, cards, reviews } from "@hibi/db/schema";
import { schedule } from "@hibi/fsrs";
import {
  CardSchema,
  CardStateRowSchema,
  DueReviewsQuerySchema,
  SubmitReviewInputSchema,
  SubmitReviewResultSchema,
} from "@hibi/types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, asc, eq, lte } from "drizzle-orm";
import { getDb } from "../db.ts";
import { serializeCardsWithUrls } from "../lib/cards.ts";
import { notFound } from "../lib/errors.ts";
import { apiKeyAuth } from "../middleware/api-key.ts";

const reviewsApp = new OpenAPIHono<{
  Variables: { auth: { userId: string; apiKeyId: string } };
}>();

reviewsApp.use("*", apiKeyAuth);

const DueResponseSchema = z.object({
  items: z.array(z.object({ card: CardSchema, cardState: CardStateRowSchema })),
});

reviewsApp.openapi(
  createRoute({
    method: "get",
    path: "/due",
    request: { query: DueReviewsQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: DueResponseSchema } },
        description: "Cards due for review",
      },
    },
  }),
  async (c) => {
    const { limit, before } = c.req.valid("query");
    const { userId } = c.get("auth");
    const db = getDb();
    const cutoff = before ? new Date(before) : new Date();

    const rows = await db
      .select({ card: cards, cardState: cardStates })
      .from(cardStates)
      .innerJoin(cards, eq(cards.id, cardStates.cardId))
      .where(and(eq(cardStates.userId, userId), lte(cardStates.due, cutoff)))
      .orderBy(asc(cardStates.due))
      .limit(limit);

    const serializedCards = await serializeCardsWithUrls(rows.map((r) => r.card));
    const items = rows.map((r, i) => {
      const card = serializedCards[i];
      if (!card) throw new Error("card serialization mismatch");
      return { card, cardState: serializeCardState(r.cardState) };
    });
    return c.json({ items }, 200);
  },
);

reviewsApp.openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: { content: { "application/json": { schema: SubmitReviewInputSchema } } },
    },
    responses: {
      201: {
        content: { "application/json": { schema: SubmitReviewResultSchema } },
        description: "Review recorded",
      },
    },
  }),
  async (c) => {
    const { cardId, rating, reviewedAt } = c.req.valid("json");
    const { userId } = c.get("auth");
    const db = getDb();
    const now = reviewedAt ? new Date(reviewedAt) : new Date();

    const result = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(cardStates)
        .where(and(eq(cardStates.cardId, cardId), eq(cardStates.userId, userId)))
        .limit(1);

      if (!current) throw notFound("Card not found");

      const { nextState, reviewLog } = schedule({
        state: {
          due: current.due,
          stability: current.stability,
          difficulty: current.difficulty,
          scheduledDays: current.scheduledDays,
          learningSteps: current.learningSteps,
          reps: current.reps,
          lapses: current.lapses,
          state: current.state,
          lastReview: current.lastReview,
        },
        rating,
        now,
      });

      const [updated] = await tx
        .update(cardStates)
        .set({
          due: nextState.due,
          stability: nextState.stability,
          difficulty: nextState.difficulty,
          scheduledDays: nextState.scheduledDays,
          learningSteps: nextState.learningSteps,
          reps: nextState.reps,
          lapses: nextState.lapses,
          state: nextState.state,
          lastReview: nextState.lastReview,
        })
        .where(and(eq(cardStates.cardId, cardId), eq(cardStates.userId, userId)))
        .returning();

      if (!updated) throw notFound("Card not found");

      const [review] = await tx
        .insert(reviews)
        .values({
          userId,
          cardId,
          rating,
          reviewedAt: now,
          elapsedDays: reviewLog.scheduledDays,
          scheduledDays: nextState.scheduledDays,
          stateBefore: current.state,
          stateAfter: nextState.state,
        })
        .returning();

      if (!review) throw new Error("Failed to insert review");

      return { review, cardState: updated };
    });

    return c.json(
      {
        review: serializeReview(result.review),
        cardState: serializeCardState(result.cardState),
      },
      201,
    );
  },
);

function serializeCardState(row: typeof cardStates.$inferSelect) {
  return {
    ...row,
    due: row.due.toISOString(),
    lastReview: row.lastReview ? row.lastReview.toISOString() : null,
  };
}

function serializeReview(row: typeof reviews.$inferSelect) {
  return {
    ...row,
    rating: row.rating as 1 | 2 | 3 | 4,
    reviewedAt: row.reviewedAt.toISOString(),
  };
}

export { reviewsApp };
