# @hibi/docs

Astro Starlight documentation site for Hibi. Deploys to `docs.hibi.app`.

Three kinds of docs live here:
- **Conceptual**: how Hibi works (architecture, FSRS, sentence mining workflow)
- **Client SDK**: hand-written guides for `hibi-client`
- **API reference**: not here — that lives at [api.hibi.app/docs](https://api.hibi.app/docs) (Scalar UI from the OpenAPI spec)

## Dev

```bash
pnpm --filter @hibi/docs dev      # http://localhost:4321
pnpm --filter @hibi/docs build
```
