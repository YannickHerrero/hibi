import {
  DailyCountQuerySchema,
  DailyCountResponseSchema,
  HeatmapQuerySchema,
  HeatmapResponseSchema,
  RetentionResponseSchema,
} from "@hibi/types";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getDb } from "../db.ts";
import { apiKeyAuth } from "../middleware/api-key.ts";
import { dailyCounts, heatmapByYear, retentionCurve } from "../services/stats.ts";

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
    return c.json(await heatmapByYear(getDb(), userId, year), 200);
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
    return c.json(await retentionCurve(getDb(), userId), 200);
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
    return c.json(await dailyCounts(getDb(), userId, from, to), 200);
  },
);

export { statsApp };
