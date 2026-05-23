import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { badRequest, badGateway } from "../lib/errors.ts";
import {
  buildOpenRouterHeaders,
  getStoredOpenRouterKey,
  OPENROUTER_BASE,
} from "../lib/openrouter.ts";
import { apiKeyAuth } from "../middleware/api-key.ts";

const ALLOWED_CHAT_MODELS = new Set<string>(["anthropic/claude-sonnet-4.5"]);
const ALLOWED_TRANSCRIPTION_MODELS = new Set<string>(["openai/whisper-large-v3-turbo"]);

const aiApp = new OpenAPIHono<{
  Variables: { auth: { userId: string; apiKeyId: string } };
}>();

aiApp.use("*", apiKeyAuth);

const ChatCompletionsRequestSchema = z
  .object({
    model: z.string(),
    stream: z.boolean().optional(),
    messages: z.array(z.unknown()).optional(),
  })
  .loose();

aiApp.openapi(
  createRoute({
    method: "post",
    path: "/chat/completions",
    request: {
      body: { content: { "application/json": { schema: ChatCompletionsRequestSchema } } },
    },
    responses: {
      200: {
        description: "OpenRouter chat completion. SSE if stream:true, JSON otherwise.",
      },
      400: { description: "Model not allowed or malformed body" },
      428: { description: "OpenRouter API key not configured for this account" },
      502: { description: "Upstream OpenRouter error" },
    },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const body = c.req.valid("json");

    if (!ALLOWED_CHAT_MODELS.has(body.model)) {
      throw badRequest(`Model "${body.model}" is not allowed`);
    }

    const apiKey = await getStoredOpenRouterKey(userId);

    let upstream: Response;
    try {
      upstream = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers: buildOpenRouterHeaders(apiKey, { contentType: "application/json" }),
        body: JSON.stringify(body),
      });
    } catch (cause) {
      throw badGateway(`OpenRouter unreachable: ${(cause as Error).message}`);
    }

    if (!upstream.body) {
      throw badGateway("OpenRouter returned an empty body");
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const headers: Record<string, string> = { "content-type": contentType };
    if (contentType.includes("text/event-stream")) {
      headers["cache-control"] = "no-cache";
    }

    return new Response(upstream.body, { status: upstream.status, headers });
  },
);

const TranscriptionsRequestSchema = z
  .object({
    model: z.string(),
  })
  .loose();

aiApp.openapi(
  createRoute({
    method: "post",
    path: "/audio/transcriptions",
    request: {
      body: { content: { "application/json": { schema: TranscriptionsRequestSchema } } },
    },
    responses: {
      200: { description: "OpenRouter transcription response (verbose_json or text)" },
      400: { description: "Model not allowed or malformed body" },
      428: { description: "OpenRouter API key not configured for this account" },
      502: { description: "Upstream OpenRouter error" },
    },
  }),
  async (c) => {
    const { userId } = c.get("auth");
    const body = c.req.valid("json");

    if (!ALLOWED_TRANSCRIPTION_MODELS.has(body.model)) {
      throw badRequest(`Model "${body.model}" is not allowed`);
    }

    const apiKey = await getStoredOpenRouterKey(userId);

    let upstream: Response;
    try {
      upstream = await fetch(`${OPENROUTER_BASE}/audio/transcriptions`, {
        method: "POST",
        headers: buildOpenRouterHeaders(apiKey, { contentType: "application/json" }),
        body: JSON.stringify(body),
      });
    } catch (cause) {
      throw badGateway(`OpenRouter unreachable: ${(cause as Error).message}`);
    }

    if (!upstream.body) {
      throw badGateway("OpenRouter returned an empty body");
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  },
);

export { aiApp };
