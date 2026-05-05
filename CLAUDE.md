# CLAUDE.md — Hibi monorepo

This file is the durable memory for Claude Code sessions in this repo. Read it before starting work. Update it whenever a convention or important context changes — that's preferred over re-explaining the same thing in chat.

> See [`../hibi-ecosystem-overview.md`](../hibi-ecosystem-overview.md) for the full architectural rationale.

---

## Commit strategy

- **Atomic, frequent, small.** One logical change per commit. Many small commits are preferred over a few big ones.
- **Imperative mood**, no trailing period: `Add X`, `Configure Y`, `Fix Z`.
- **Stage by path**, never `git add -A` or `git add .` at the repo root.
- The branch is **`master`** (not `main`). PRs target `master`.
- Never commit secrets, `.env` files, or anything containing real credentials.
- A typical setup-flow commit pair: `Install <pkg>` (touches `package.json` + `pnpm-lock.yaml`), then `Configure <pkg>` (touches the tool's config file). Keep them separate so installs and config changes are independently revertable.

## Monorepo layout

```
apps/        api, portal, docs, design   (each deployable to Vercel)
packages/    db, fsrs, japanese, types   (private @hibi/* workspaces)
             api-client                  (published as `hibi-client`, unscoped)
```

- All private workspace packages are scoped `@hibi/<name>` and have `"private": true`.
- `hibi-client` is the **only** publishable package. It stays unscoped to match the publisher (`yannickhrr`) account convention.
- Internal cross-package imports use `workspace:*` in `dependencies`.
- All packages extend `tsconfig.base.json`.

## Tooling

| Concern | Tool | Notes |
|---|---|---|
| Package manager | pnpm 10 | `packageManager` pinned in root `package.json` |
| Task runner | Turborepo 2 | `tasks` block in `turbo.json` (not `pipeline`) |
| Lint + format | Biome 2 | `biome.json` at root, no ESLint/Prettier |
| Versioning + publish | Changesets | Only `hibi-client` is released; `@hibi/*` are private and skipped automatically |
| Bundling published pkg | tsup | ESM + CJS + `.d.ts` |
| Testing | Vitest | One config per package/app |
| Node | 24 LTS | `.nvmrc` pins it |

## Key tech choices

- **API**: Hono + `@hono/zod-openapi` + `@scalar/hono-api-reference` mounted at `/docs`. Vercel entry at `apps/api/api/index.ts` exporting `default app` (Vercel Fluid Compute pattern).
- **DB**: Supabase Postgres via Drizzle ORM (`postgres-js` driver). Migrations live in `packages/db/drizzle/`.
- **Auth**: Supabase Auth, **email OTP only** — no passwords, no OAuth, no magic links. Clients (Kiseki/Horu/Tsumu) use API keys (`Authorization: Bearer <key>`).
- **Scheduler**: `ts-fsrs`. Wrapped behind `@hibi/fsrs.schedule(state, rating, now)`.
- **Wire format source of truth**: Zod schemas in `@hibi/types`. Never hand-author response shapes elsewhere.
- **Dictionary data**: NEVER served from this API. JMdict and morphological analysis live in mining clients only (sibling repos).

## Design system

- Visual foundation = the **Torakaa Design System** (linked in the overview). Hibi extensions on top of Torakaa live in `DESIGN_SYSTEM.md` and `apps/design/`.
- The reference site `apps/design/` exposes all 5 Torakaa variants and the Hibi extension components.
- Reference Torakaa tokens by name (e.g. `accent.default`), never raw color values.

## Things never to do

- Don't add JMdict or dictionary endpoints to the API.
- Don't add password or OAuth login flows.
- Don't introduce Supabase RLS — ownership is enforced server-side in Hono handlers.
- Don't share component code across web and React Native — implement natively from the spec on each platform.
- Don't commit auto-generated build output. `dist/`, `.turbo/`, `.astro/`, `.vercel/` are gitignored.
- Don't bypass `.env.example` — every new env var goes there first, with a description.

## When to update this file

Any time you discover or decide a convention that future sessions need to follow. Examples:
- A new tool added or replaced
- A naming convention codified
- A non-obvious gotcha (a workaround for a bug, a constraint imposed by a service)

Don't capture ephemeral context (in-progress work, current task) — that's what TaskCreate is for.
