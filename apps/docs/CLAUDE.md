# CLAUDE.md — apps/docs

Astro Starlight docs site for Hibi. Deploys to `docs.hibi.app`.

## What lives here

- **Conceptual docs** — how Hibi works (architecture, FSRS, sentence mining workflow)
- **Client SDK guides** — hand-written docs for `hibi-client`

## What does NOT live here

- **API reference** — that's auto-generated and served by `apps/api` at `api.hibi.app/docs` (Scalar UI from the OpenAPI spec). Don't duplicate endpoint docs here.

## Layout

```
src/
  content.config.ts                 // defines the `docs` content collection
  content/docs/
    index.mdx                       // splash homepage
    getting-started.mdx
    client-sdk/overview.mdx
    concepts/fsrs.mdx
astro.config.mjs                    // Starlight integration + sidebar
```

When adding a page, both place the MDX file under `src/content/docs/` AND register it in the sidebar in `astro.config.mjs`.

## Dev

```bash
pnpm --filter @hibi/docs dev      # http://localhost:4321
pnpm --filter @hibi/docs build
```
