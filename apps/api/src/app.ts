import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { getEnv } from "./env.ts";
import { accountApp } from "./routes/account.ts";
import { cardsApp } from "./routes/cards.ts";
import { reviewsApp } from "./routes/reviews.ts";
import { sessionsApp } from "./routes/sessions.ts";
import { statsApp } from "./routes/stats.ts";
import { uploadsApp } from "./routes/uploads.ts";
import { wordStatusApp } from "./routes/word-status.ts";

const app = new OpenAPIHono();

app.use("*", logger());

app.use("*", async (c, next) => {
  const env = getEnv();
  return cors({
    origin: env.NODE_ENV === "development" ? "*" : env.PORTAL_URL,
    credentials: true,
  })(c, next);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          code: err.status === 401 ? "unauthorized" : err.status === 404 ? "not_found" : "error",
          message: err.message,
        },
      },
      err.status,
    );
  }
  console.error(err);
  return c.json({ error: { code: "internal_error", message: "Internal server error" } }, 500);
});

app.route("/v1/cards", cardsApp);
app.route("/v1/reviews", reviewsApp);
app.route("/v1/stats", statsApp);
app.route("/v1/account", accountApp);
app.route("/v1/sessions", sessionsApp);
app.route("/v1/uploads", uploadsApp);
// word-status app mounts both /v1/word-status and /v1/known-words.
app.route("/v1", wordStatusApp);

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Hibi API",
    version: "0.0.0",
    description: "Flashcard backend for the Hibi SRS ecosystem.",
  },
});

app.get(
  "/docs",
  Scalar({
    url: "/openapi.json",
    pageTitle: "Hibi API Reference",
  }),
);

app.get("/", (c) =>
  c.json({
    name: "hibi-api",
    docs: "/docs",
    openapi: "/openapi.json",
  }),
);

export { app };
