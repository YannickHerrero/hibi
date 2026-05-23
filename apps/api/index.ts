import { app } from "./src/app.ts";

// /v1/ai/* proxies OpenRouter. Streaming chat completions and TTS/STT
// can hold the function open for a while; bump from Vercel's default to
// the Fluid Compute max.
export const maxDuration = 300;

export default app;
