# Hibi

> Day by day. — A self-hosted, web-API-based SRS (Spaced Repetition System) for Japanese sentence mining.

This monorepo is the **core** of the Hibi ecosystem: it holds the Hibi API, account portal, stats dashboard, documentation site, and design-system reference site, and publishes the `hibi-client` SDK that every other app builds on. The mining and review clients live in their own sibling repos — see below.

## The Hibi ecosystem

Hibi is a **central API with many clients**: one flashcard backend, user-owned API keys, and a family of apps that all speak to it through the `hibi-client` SDK. *Mining* clients turn immersion content — video, audio, text — into SRS cards; *review* clients are where you study them.

| App | Role | Platform | Repo |
|---|---|---|---|
| **Hibi** | Core: API, account portal, stats dashboard, docs, design system, `hibi-client` SDK | Web | this monorepo |
| **Hibi Kioku** — 記憶, *"memory"* | Review: study due cards and browse your card library | Web | [hibi-kioku](https://github.com/YannickHerrero/hibi-kioku) |
| **Hibi Nuku** — 抜く, *"extraction"* | Mining: upload anime/shows, watch with a popup dictionary, mine sentences | Web (self-hosted) | [hibi-nuku](https://github.com/YannickHerrero/hibi-nuku) |
| **Hibi Toru** | Mining: pair a video with subtitles, watch with tap-to-define, mine cards | Mobile (Expo) | [hibi-toru](https://github.com/YannickHerrero/hibi-toru) |
| **Hibi Koe** — 声, *"voice"* | Mining: passive listening — import audio + subtitles into a Spotify-style player | Mobile (Expo) | [Hibi-Koe](https://github.com/YannickHerrero/Hibi-Koe) |
| **Hibi Yomi** — 読, *"read"* | Mining: graded reader — import a story, tap-to-define, mine cards | Mobile (Expo) | [hibi-yomi](https://github.com/YannickHerrero/hibi-yomi) |

**How a card flows:** a mining client tokenises immersion content locally (kuromoji / lindera + JMdict), shows a Yomitan-style popup, and writes the card — sentence, furigana, audio clip, screenshot, kanji breakdown — into the Hibi API. From there it is FSRS-scheduled and reviewed in **Hibi Kioku** or any other review surface.

The API itself is strictly a flashcard backend — cards, reviews, stats, account/keys. Dictionary data and morphological analysis live entirely inside each client. See [`../hibi-ecosystem-overview.md`](../hibi-ecosystem-overview.md) for the full architectural rationale.

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
