import { reviews } from "@hibi/db/schema";
import {
  DailyCountQuerySchema,
  DailyCountResponseSchema,
  HeatmapQuerySchema,
  HeatmapResponseSchema,
  RetentionResponseSchema,
} from "@hibi/types";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { getDb } from "../db.ts";
import { apiKeyAuth } from "../middleware/api-key.ts";

const statsApp = new OpenAPIHono<{
  Variables: { auth: { userId: string; apiKeyId: string } };
}>();

statsApp.use("*", apiKeyAuth);

statsApp.openapi(
  createRoute({
    method: "get",
    path: "/heatmap",
    request: { query: HeatmapQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: HeatmapResponseSchema } },
        description: "Yearly review heatmap",
      },
    },
  }),
  async (c) => {
    const { year } = c.req.valid("query");
    const { userId } = c.get("auth");
    const db = getDb();

    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    const dateExpr = sql<string>`to_char(${reviews.reviewedAt}, 'YYYY-MM-DD')`;

    const rows = await db
      .select({
        date: dateExpr.as("date"),
        count: sql<number>`COUNT(*)::int`.as("count"),
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          gte(reviews.reviewedAt, start),
          lt(reviews.reviewedAt, end),
        ),
      )
      .groupBy(dateExpr);

    return c.json({ year, days: rows }, 200);
  },
);

statsApp.openapi(
  createRoute({
    method: "get",
    path: "/retention",
    responses: {
      200: {
        content: { "application/json": { schema: RetentionResponseSchema } },
        description: "Retention curve",
      },
    },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const db = getDb();
    const intervalExpr = sql<number>`ROUND(${reviews.elapsedDays})::int`;

    const rows = await db
      .select({
        intervalDays: intervalExpr.as("interval_days"),
        retention: sql<number>`
          (COUNT(*) FILTER (WHERE ${reviews.rating} >= 3))::float
          / NULLIF(COUNT(*), 0)
        `.as("retention"),
        sampleSize: sql<number>`COUNT(*)::int`.as("sample_size"),
      })
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .groupBy(intervalExpr)
      .orderBy(intervalExpr);

    return c.json(
      {
        generatedAt: new Date().toISOString(),
        points: rows.map((r) => ({
          intervalDays: r.intervalDays,
          retention: r.retention ?? 0,
          sampleSize: r.sampleSize,
        })),
      },
      200,
    );
  },
);

statsApp.openapi(
  createRoute({
    method: "get",
    path: "/daily",
    request: { query: DailyCountQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: DailyCountResponseSchema } },
        description: "Per-day review counts with rating breakdown",
      },
    },
  }),
  async (c) => {
    const { from, to } = c.req.valid("query");
    const { userId } = c.get("auth");
    const db = getDb();

    const fromDate = new Date(`${from}T00:00:00Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);
    const dateExpr = sql<string>`to_char(${reviews.reviewedAt}, 'YYYY-MM-DD')`;

    const rows = await db
      .select({
        date: dateExpr.as("date"),
        reviews: sql<number>`COUNT(*)::int`.as("reviews"),
        again: sql<number>`COUNT(*) FILTER (WHERE ${reviews.rating} = 1)::int`.as("again"),
        hard: sql<number>`COUNT(*) FILTER (WHERE ${reviews.rating} = 2)::int`.as("hard"),
        good: sql<number>`COUNT(*) FILTER (WHERE ${reviews.rating} = 3)::int`.as("good"),
        easy: sql<number>`COUNT(*) FILTER (WHERE ${reviews.rating} = 4)::int`.as("easy"),
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          gte(reviews.reviewedAt, fromDate),
          lt(reviews.reviewedAt, toDate),
        ),
      )
      .groupBy(dateExpr)
      .orderBy(dateExpr);

    return c.json({ days: rows }, 200);
  },
);

export { statsApp };
