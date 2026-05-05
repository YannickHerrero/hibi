# Hibi

> Day by day. — A self-hosted, web-API-based SRS (Spaced Repetition System) for Japanese sentence mining.

This monorepo holds the Hibi API, web portal, documentation site, and design-system reference site. Mobile apps (Kiseki, Horu) and the desktop mining client (Tsumu) live in separate sibling repos.

See [`../hibi-ecosystem-overview.md`](../hibi-ecosystem-overview.md) for the full architectural rationale.

## Layout

```
apps/
  api/         Hono API → api.hibi.app (Vercel Function on Fluid Compute)
  portal/      Vite + React → app.hibi.app (account, API keys, stats)
  docs/        Astro Starlight → docs.hibi.app
  design/      Vite + React → design.hibi.app (Torakaa variants + Hibi extensions)

packages/
  db/          @hibi/db — Drizzle schema (source of truth)
  fsrs/        @hibi/fsrs — ts-fsrs wrapper + scheduling
  japanese/    @hibi/japanese — shared JP utils (furigana, Token type)
  types/       @hibi/types — Zod schemas + inferred TS types
  api-client/  hibi-client — published TS client for the Hibi API
```

## Quick start

```bash
nvm use                    # Node 24 (matches .nvmrc)
pnpm install
cp .env.example .env       # fill in real values
pnpm dev                   # runs all apps in parallel via Turbo
```

## Common scripts

```bash
pnpm build                 # build everything via Turbo
pnpm typecheck
pnpm lint                  # Biome
pnpm format                # Biome format --write
pnpm test                  # Vitest across packages
pnpm changeset             # record a release note for hibi-client
```

## Tech stack

- **API**: Hono + `@hono/zod-openapi` + Scalar reference UI
- **DB**: Supabase Postgres + Drizzle ORM
- **Auth**: Supabase Auth (email OTP only) for the portal; API keys for clients
- **Scheduling**: `ts-fsrs`
- **Web**: Vite + React 19, TypeScript everywhere
- **Docs**: Astro Starlight
- **Tooling**: pnpm workspaces, Turborepo, Biome, Changesets, tsup, Vitest
- **Hosting**: Vercel (all apps + API as Fluid Compute Function)

## Conventions

See [`CLAUDE.md`](./CLAUDE.md) for commit strategy, monorepo conventions, and Claude Code guidance.

## Design system

The visual foundation is the Torakaa Design System. Hibi-specific extensions are documented in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) and rendered live at `apps/design/`.

## License

MIT
