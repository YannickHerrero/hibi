# CLAUDE.md — apps/api

Hono API for Hibi. Deploys to Vercel as a Fluid Compute Function.

## Entry points

- `src/app.ts` — Hono app composition (middleware, routes, OpenAPI, Scalar)
- `src/server.ts` — local dev server via `@hono/node-server`
- `index.ts` — Vercel function entry; `export default app`

Vercel's auto-detector (with Root Directory = `apps/api`) picks up a single top-level `index.ts` exporting a fetch-handler-compatible app and routes all paths to it. Don't move the entry back into a `api/` subfolder — that's the legacy multi-function pattern and the detector won't find it.

## Layout

```
index.ts             // Vercel default export
src/
  app.ts             // composed Hono app
  server.ts          // local dev (tsx watch)
  env.ts             // Zod-validated env (singleton)
  db.ts              // Drizzle instance (singleton)
  lib/
    crypto.ts        // API key gen + HMAC-SHA256 hashing
    errors.ts        // typed HTTP errors
  middleware/
    api-key.ts       // Bearer hibi_<key> -> userId via api_keys lookup
    supabase-auth.ts // Bearer <jwt> -> userId via Supabase service-role
  routes/
    cards.ts, reviews.ts, stats.ts, account.ts
```

## Auth split

- `/v1/cards`, `/v1/reviews`, `/v1/stats` use **API key** auth (clients).
- `/v1/account/*` uses **Supabase JWT** auth (portal only).
- Don't mix the two on the same route.

## Common gotchas

- All routes filter by `userId` from `c.get("auth")`. Never trust an `id` in the request body for ownership.
- The Drizzle `transaction()` block is required for `POST /v1/reviews` so `card_states` and `reviews` stay consistent.
- API keys are HMAC-SHA256 with `API_KEY_PEPPER` — fast lookup, NOT argon2. The hash IS the lookup key.
- The `error` response shape comes from `@hibi/types` `ErrorResponseSchema`. Stick to it.

## Dev

```bash
pnpm --filter @hibi/api dev    # http://localhost:3000
pnpm --filter @hibi/api test
```

`.env` must be populated. See `../.env.example`.
