# @hibi/api

Hono-based flashcard API for the Hibi ecosystem. Deploys to `api.hibi.app` as a Vercel Function on Fluid Compute.

## Routes

| Path | Auth | Purpose |
|---|---|---|
| `GET /docs` | none | Scalar API reference UI (auto-generated from Zod) |
| `GET /openapi.json` | none | OpenAPI 3.1 spec |
| `GET /v1/account/me` | Supabase JWT | Current account |
| `GET/POST/DELETE /v1/account/keys` | Supabase JWT | Manage API keys |
| `GET/POST/PATCH/DELETE /v1/cards` | API key | Card CRUD |
| `GET /v1/reviews/due` | API key | Cards due now |
| `POST /v1/reviews` | API key | Submit a review (calls FSRS, updates state) |
| `GET /v1/stats/heatmap` | API key | Yearly heatmap |
| `GET /v1/stats/retention` | API key | Retention curve |
| `GET /v1/stats/daily` | API key | Per-day review counts |

## Auth

- **Portal-only routes** (`/v1/account/*`) accept a Supabase JWT in `Authorization: Bearer <jwt>`. The portal logs in via email OTP and forwards the JWT.
- **Client routes** (cards, reviews, stats) require an API key in `Authorization: Bearer hibi_<...>`. Keys are hashed at rest (argon2) and matched against the `api_keys` table.

## Dev

```bash
pnpm --filter @hibi/api dev   # local server via tsx watch (hono/node-server)
```

## Vercel

The handler at `api/index.ts` exports `default app` — Vercel auto-detects Hono and runs it on Fluid Compute. No `vercel.json` rewrites needed beyond mapping the root.
