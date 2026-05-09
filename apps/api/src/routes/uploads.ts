import { Hono } from "hono";
import { badRequest } from "../lib/errors.ts";
import { uploadMedia } from "../lib/storage.ts";
import { type ApiKeyContext, apiKeyAuth } from "../middleware/api-key.ts";

// Why a plain Hono app instead of OpenAPIHono: multipart upload doesn't
// flow through the zod-openapi pipeline cleanly today (parseBody returns
// File-like values that don't fit a JSON schema). Keeping this route
// hand-rolled avoids fighting the framework while we land the surface.

const uploadsApp = new Hono<{ Variables: { auth: ApiKeyContext } }>();

uploadsApp.use("*", apiKeyAuth);

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_AUDIO_MIME = new Set([
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/mpeg",
  "audio/ogg",
]);

uploadsApp.post("/audio", async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!file || typeof file === "string" || !(file instanceof File)) {
    throw badRequest("missing 'file' field");
  }
  if (file.size > MAX_BYTES) {
    throw badRequest(`file exceeds ${MAX_BYTES / 1024 / 1024} MB`);
  }
  const contentType = file.type || "audio/mp4";
  if (!ALLOWED_AUDIO_MIME.has(contentType)) {
    throw badRequest(`unsupported audio mime: ${contentType}`);
  }

  const { userId } = c.get("auth");
  const ext = pickExt(contentType);
  const path = `audio/${userId}/${crypto.randomUUID()}${ext}`;
  const buf = await file.arrayBuffer();
  const { key } = await uploadMedia(path, buf, contentType);
  return c.json({ key }, 201);
});

function pickExt(mime: string): string {
  if (mime === "audio/mpeg") return ".mp3";
  if (mime === "audio/ogg") return ".ogg";
  if (mime === "audio/aac") return ".aac";
  return ".m4a";
}

export { uploadsApp };
