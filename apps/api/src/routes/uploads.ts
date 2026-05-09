import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import { badRequest } from "../lib/errors.ts";
import { uploadMedia } from "../lib/storage.ts";
import { type ApiKeyContext, apiKeyAuth } from "../middleware/api-key.ts";

const uploadsApp = new OpenAPIHono<{ Variables: { auth: ApiKeyContext } }>();

uploadsApp.use("*", apiKeyAuth);

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

const ALLOWED_AUDIO_MIME = new Set([
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/mpeg",
  "audio/ogg",
]);

// z.any() so the multipart File passes through; the .openapi() override
// is what makes Scalar render a proper file picker.
const FileFieldSchema = z.any().openapi({ type: "string", format: "binary" });
const UploadFormSchema = z.object({ file: FileFieldSchema });
const UploadResponseSchema = z.object({ key: z.string() });

uploadsApp.openapi(
  createRoute({
    method: "post",
    path: "/audio",
    summary: "Upload audio",
    description: "Uploads an audio clip (m4a/mp3/ogg/aac, max 5 MB) to the media bucket.",
    request: {
      body: {
        content: { "multipart/form-data": { schema: UploadFormSchema } },
        required: true,
      },
    },
    responses: {
      201: {
        content: { "application/json": { schema: UploadResponseSchema } },
        description: "Upload created",
      },
    },
  }),
  async (c) => {
    const file = await readFile(c);
    if (file.size > MAX_AUDIO_BYTES) {
      throw badRequest(`file exceeds ${MAX_AUDIO_BYTES / 1024 / 1024} MB`);
    }
    const contentType = file.type || "audio/mp4";
    if (!ALLOWED_AUDIO_MIME.has(contentType)) {
      throw badRequest(`unsupported audio mime: ${contentType}`);
    }

    const { userId } = c.get("auth");
    const path = `audio/${userId}/${crypto.randomUUID()}${pickAudioExt(contentType)}`;
    const buf = await file.arrayBuffer();
    const { key } = await uploadMedia(path, buf, contentType);
    return c.json({ key }, 201);
  },
);

async function readFile(c: Context): Promise<File> {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!file || typeof file === "string" || !(file instanceof File)) {
    throw badRequest("missing 'file' field");
  }
  return file;
}

function pickAudioExt(mime: string): string {
  if (mime === "audio/mpeg") return ".mp3";
  if (mime === "audio/ogg") return ".ogg";
  if (mime === "audio/aac") return ".aac";
  return ".m4a";
}

export { uploadsApp };
