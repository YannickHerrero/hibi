import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { getEnv } from "./env.ts";
import { accountApp } from "./routes/account.ts";
import { accountOpenRouterApp } from "./routes/account-openrouter.ts";
import { aiApp } from "./routes/ai.ts";
import { cardsApp } from "./routes/cards.ts";
import { reviewsApp } from "./routes/reviews.ts";
import { sessionsApp } from "./routes/sessions.ts";
import { statsApp } from "./routes/stats.ts";
import { uploadsApp } from "./routes/uploads.ts";
import { wordStatusApp } from "./routes/word-status.ts";

const app = new OpenAPIHono();

app.use("*", logger());

// CORS policy is split by route:
// - /v1/account/* uses Supabase JWT (portal-only) — origin-locked to PORTAL_URL.
// - Everything else uses API-key Bearer auth. The key is the security boundary,
//   not the origin, so CORS is open to support third-party apps in the ecosystem.
app.use("*", async (c, next) => {
  const env = getEnv();
  const isPortalRoute = c.req.path.startsWith("/v1/account/");

  if (isPortalRoute) {
    return cors({
      origin: env.NODE_ENV === "development" ? "*" : env.PORTAL_URL,
      credentials: true,
    })(c, next);
  }

  return cors({ origin: "*", credentials: false })(c, next);
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
app.route("/v1/account/openrouter-key", accountOpenRouterApp);
app.route("/v1/ai", aiApp);
app.route("/v1/sessions", sessionsApp);
app.route("/v1/uploads", uploadsApp);
// word-status app mounts both /v1/word-status and /v1/known-words.
app.route("/v1", wordStatusApp);

app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "hibi_<key>",
  description:
    "API key issued from the user's portal at app.hibi.app. Send it as `Authorization: Bearer hibi_<key>`. /v1/account/* routes accept a Supabase JWT instead (portal-only).",
});

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Hibi API",
    version: "0.0.0",
    description:
      "Flashcard backend for the Hibi SRS ecosystem. Authenticate with a per-user API key (Bearer hibi_<key>). The official TypeScript SDK is published as `hibi-client` on npm.",
  },
  security: [{ bearerAuth: [] }],
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
