# hibi-client

## 0.4.0

### Minor Changes

- 6d5246f: Card responses now include `audioUrl` and `imageUrl` (signed Supabase storage URLs, ~1h TTL; null when no key is set), so consumers can render media directly without a separate signing call. `cards.list()` accepts two new query params: `q` (case-insensitive substring match across `sentence` and `focusWord`) and `sort` (`"newest"` | `"oldest"` | `"due-soonest"`). The previously declared but ignored `tag` and `source` filters now actually narrow results.

## 0.1.0

### Minor Changes

- 779fc79: Initial public release. Surface includes cards CRUD, reviews due/submit, and stats (heatmap, retention, daily counts). Runtime Zod validation against `@hibi/types`. ESM + CJS + types via tsup.
