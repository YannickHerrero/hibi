---
"hibi-client": minor
---

Add `ai` namespace for the new server-side OpenRouter proxy.

- `ai.key()` — discovery: returns whether the user has configured an OpenRouter key in the Hibi portal, plus live usage/limit when configured.
- `ai.chatCompletions(body)` — returns the raw `Response`. When `stream: true`, drain `res.body` for SSE frames; otherwise call `res.json()`.
- `ai.audio.transcriptions(body)` — returns the parsed OpenRouter transcription JSON.
- `ai.audio.speech(body)` — returns a `Uint8Array` of audio bytes (MP3 by default).

The OpenRouter API key now lives encrypted on the Hibi server, not on each client. Users configure it once at app.hibi.app under **AI**.
