# hibi-client

## 0.5.0

### Minor Changes

- 2eb67e5: Add `ai` namespace for the new server-side OpenRouter proxy.
  - `ai.key()` — discovery: returns whether the user has configured an OpenRouter key in the Hibi portal, plus live usage/limit when configured.
  - `ai.chatCompletions(body)` — returns the raw `Response`. When `stream: true`, drain `res.body` for SSE frames; otherwise call `res.json()`.
  - `ai.audio.transcriptions(body)` — returns the parsed OpenRouter transcription JSON.
  - `ai.audio.speech(body)` — returns a `Uint8Array` of audio bytes (MP3 by default).

  The OpenRouter API key now lives encrypted on the Hibi server, not on each client. Users configure it once at app.hibi.app under **AI**.

## 0.4.0

### Minor Changes

- 6d5246f: Card responses now include `audioUrl` and `imageUrl` (signed Supabase storage URLs, ~1h TTL; null when no key is set), so consumers can render media directly without a separate signing call. `cards.list()` accepts two new query params: `q` (case-insensitive substring match across `sentence` and `focusWord`) and `sort` (`"newest"` | `"oldest"` | `"due-soonest"`). The previously declared but ignored `tag` and `source` filters now actually narrow results.

## 0.1.0

### Minor Changes

- 779fc79: Initial public release. Surface includes cards CRUD, reviews due/submit, and stats (heatmap, retention, daily counts). Runtime Zod validation against `@hibi/types`. ESM + CJS + types via tsup.
