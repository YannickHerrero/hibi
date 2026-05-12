---
"hibi-client": minor
---

Card responses now include `audioUrl` and `imageUrl` (signed Supabase storage URLs, ~1h TTL; null when no key is set), so consumers can render media directly without a separate signing call. `cards.list()` accepts two new query params: `q` (case-insensitive substring match across `sentence` and `focusWord`) and `sort` (`"newest"` | `"oldest"` | `"due-soonest"`). The previously declared but ignored `tag` and `source` filters now actually narrow results.
