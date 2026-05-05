# @hibi/types

Zod schemas and inferred TypeScript types — the wire-format source of truth for the Hibi API.

Used by:
- `apps/api` to validate inbound bodies and to generate OpenAPI shapes
- `packages/api-client` to runtime-validate responses and expose typed methods
- `apps/portal` for typed forms and request bodies

If a shape exists in the wire format, it lives here. Never hand-author response shapes elsewhere.
