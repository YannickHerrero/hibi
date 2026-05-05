# @hibi/db

Drizzle schema and Postgres client for the Hibi monorepo. Source of truth for the database shape.

## Schema

| Table | Purpose |
|---|---|
| `cards` | Card content (sentence, focus word, furigana, glosses, kanji, media). Mostly immutable after creation. |
| `card_states` | FSRS scheduling state (due, stability, difficulty, reps, lapses). 1:1 with `cards`. |
| `reviews` | Append-only event log of every review. Powers heatmap and retention stats. |
| `api_keys` | Hashed API keys for client authentication (`Authorization: Bearer ...`). |
| `clients` | Lightweight client identifier per request, for per-app usage analytics (optional). |

## Scripts

```bash
pnpm --filter @hibi/db db:generate   # generate SQL migrations from schema
pnpm --filter @hibi/db db:migrate    # apply migrations against DATABASE_URL
pnpm --filter @hibi/db db:push       # push schema directly (dev only)
pnpm --filter @hibi/db db:studio     # open Drizzle Studio
```
