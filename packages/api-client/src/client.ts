import { z } from "zod";
import {
  CardSchema,
  ClientAiStatusSchema,
  type CreateCardInput,
  CreateCardInputSchema,
  type DailyCountQuery,
  DailyCountResponseSchema,
  type HeatmapQuery,
  HeatmapResponseSchema,
  KnownWordSchema,
  type ListCardsQuery,
  ManualWordStatusSchema,
  PaginatedSchema,
  type PaginationQuery,
  RetentionResponseSchema,
  CreateSessionInputSchema,
  type CreateSessionInput,
  type SetWordStatusInput,
  SetWordStatusInputSchema,
  ListSessionsQuerySchema,
  type ListSessionsQuery,
  SessionSchema,
  type SubmitReviewInput,
  SubmitReviewInputSchema,
  SubmitReviewResultSchema,
  type UpdateCardInput,
  UpdateCardInputSchema,
} from "./_vendored/hibi-types/index.ts";

export interface HibiClientConfig {
  apiKey: string;
  baseUrl: string;
  fetch?: typeof fetch;
}

export interface HibiClientError extends Error {
  status: number;
  body: unknown;
}

const PaginatedCardSchema = PaginatedSchema(CardSchema);
const PaginatedSessionSchema = PaginatedSchema(SessionSchema);
const PaginatedManualStatusSchema = PaginatedSchema(ManualWordStatusSchema);
const PaginatedKnownWordSchema = PaginatedSchema(KnownWordSchema);
const NullableManualStatusSchema = ManualWordStatusSchema.nullable();
const DueResponseSchema = z.object({
  items: z.array(
    z.object({ card: CardSchema, cardState: SubmitReviewResultSchema.shape.cardState }),
  ),
});
const UploadResponseSchema = z.object({ key: z.string() });

// React-Native-style file reference. RN's FormData.append accepts this
// shape directly; we type it explicitly so consumers can build it
// without depending on RN-specific globals.
export type RNFileRef = { uri: string; name: string; type: string };

// What client.uploads.* accepts. On web pass a Blob/File; on RN pass an
// RNFileRef. In both cases the SDK builds the multipart body.
export type UploadInput = Blob | RNFileRef;
export type AudioUploadInput = UploadInput;

function asError(status: number, body: unknown, message?: string): HibiClientError {
  const err = new Error(message ?? `Hibi API error: ${status}`) as HibiClientError;
  err.status = status;
  err.body = body;
  return err;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

export function createHibiClient(config: HibiClientConfig) {
  const fetchImpl = config.fetch ?? fetch;
  const base = config.baseUrl.replace(/\/+$/, "");

  async function request<T>(
    method: string,
    path: string,
    schema: z.ZodType<T>,
    init: {
      body?: unknown;
      query?: Record<string, string | number | undefined>;
    } = {},
  ): Promise<T> {
    const url = new URL(`${base}${path}`);
    if (init.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
    };
    const requestInit: RequestInit = { method, headers };
    if (init.body !== undefined) {
      if (isFormData(init.body)) {
        // Don't set Content-Type for multipart — the runtime appends
        // the correct boundary. RN in particular breaks if we set it.
        requestInit.body = init.body;
      } else {
        headers["Content-Type"] = "application/json";
        requestInit.body = JSON.stringify(init.body);
      }
    }

    const res = await fetchImpl(url.toString(), requestInit);

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    const contentType = res.headers.get("content-type") ?? "";
    let body: unknown = null;
    if (text) {
      if (contentType.includes("application/json")) {
        try {
          body = JSON.parse(text);
        } catch (err) {
          throw asError(
            res.status,
            { rawText: text.slice(0, 500), parseError: String(err) },
            `Hibi API ${res.status}: malformed JSON from ${url.toString()} (first 200 chars: ${text.slice(0, 200)})`,
          );
        }
      } else {
        // Non-JSON response — almost always means we hit a misrouted host
        // (Vercel 404 wall, gateway HTML, captive portal). Surface the
        // first chunk of the body so the caller knows where to look.
        throw asError(
          res.status,
          { rawText: text.slice(0, 500), contentType },
          `Hibi API ${res.status}: expected JSON from ${url.toString()} but got ${contentType || "unknown content-type"} (first 200 chars: ${text.slice(0, 200)})`,
        );
      }
    }

    if (!res.ok) throw asError(res.status, body);
    return schema.parse(body);
  }

  // Like request() but returns the raw Response without parsing. Used by
  // /v1/ai/* proxy routes where the response body might be SSE, binary
  // audio, or OR-shaped JSON we deliberately don't validate.
  async function requestRaw(
    method: string,
    path: string,
    init: { body?: unknown; query?: Record<string, string | number | undefined> } = {},
  ): Promise<Response> {
    const url = new URL(`${base}${path}`);
    if (init.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
    };
    const requestInit: RequestInit = { method, headers };
    if (init.body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestInit.body = JSON.stringify(init.body);
    }
    const res = await fetchImpl(url.toString(), requestInit);
    if (!res.ok) {
      const text = await res.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        // keep as text
      }
      throw asError(res.status, body);
    }
    return res;
  }

  function buildUploadForm(input: UploadInput, defaultName: string): FormData {
    const fd = new FormData();
    if (typeof Blob !== "undefined" && input instanceof Blob) {
      // Blob/File on web/node20+. Pass a name so the server sees a filename.
      const name = "name" in input && typeof input.name === "string" ? input.name : defaultName;
      fd.append("file", input, name);
    } else {
      // RN file ref. The cast is unavoidable: RN's FormData accepts this
      // shape but the lib.dom.d.ts FormData type doesn't model it.
      fd.append("file", input as unknown as Blob);
    }
    return fd;
  }

  return {
    cards: {
      async create(input: CreateCardInput) {
        const validated = CreateCardInputSchema.parse(input);
        return request("POST", "/v1/cards", CardSchema, { body: validated });
      },
      async list(query: ListCardsQuery = { limit: 50, sort: "newest" }) {
        return request("GET", "/v1/cards", PaginatedCardSchema, {
          query: {
            limit: query.limit,
            cursor: query.cursor,
            tag: query.tag,
            source: query.source,
            q: query.q,
            sort: query.sort,
          },
        });
      },
      async get(id: string) {
        return request("GET", `/v1/cards/${id}`, CardSchema);
      },
      async update(id: string, input: UpdateCardInput) {
        const validated = UpdateCardInputSchema.parse(input);
        return request("PATCH", `/v1/cards/${id}`, CardSchema, { body: validated });
      },
      async remove(id: string): Promise<void> {
        await request("DELETE", `/v1/cards/${id}`, z.unknown());
      },
    },

    uploads: {
      async audio(input: UploadInput) {
        return request("POST", "/v1/uploads/audio", UploadResponseSchema, {
          body: buildUploadForm(input, "clip.m4a"),
        });
      },
      async image(input: UploadInput) {
        return request("POST", "/v1/uploads/image", UploadResponseSchema, {
          body: buildUploadForm(input, "image.jpg"),
        });
      },
    },

    sessions: {
      async create(input: CreateSessionInput) {
        const validated = CreateSessionInputSchema.parse(input);
        return request("POST", "/v1/sessions", SessionSchema, { body: validated });
      },
      async list(query: ListSessionsQuery = { limit: 50 }) {
        const validated = ListSessionsQuerySchema.parse(query);
        return request("GET", "/v1/sessions", PaginatedSessionSchema, {
          query: {
            limit: validated.limit,
            cursor: validated.cursor,
            kind: validated.kind,
            source: validated.source,
            from: validated.from,
            to: validated.to,
          },
        });
      },
    },

    reviews: {
      async due(query: { limit?: number; before?: string } = {}) {
        return request("GET", "/v1/reviews/due", DueResponseSchema, {
          query: { limit: query.limit, before: query.before },
        });
      },
      async submit(input: SubmitReviewInput) {
        const validated = SubmitReviewInputSchema.parse(input);
        return request("POST", "/v1/reviews", SubmitReviewResultSchema, { body: validated });
      },
    },

    wordStatus: {
      // Upsert (lemma, reading) for the caller; pass status: null to delete.
      async set(input: SetWordStatusInput) {
        const validated = SetWordStatusInputSchema.parse(input);
        return request("PUT", "/v1/word-status", NullableManualStatusSchema, {
          body: validated,
        });
      },
      // Paginated list of just the manual rows (no SRS rows).
      async list(query: PaginationQuery = { limit: 50 }) {
        return request("GET", "/v1/word-status", PaginatedManualStatusSchema, {
          query: { limit: query.limit, cursor: query.cursor },
        });
      },
    },

    knownWords: {
      // Merged manual + SRS classifications. Single source of truth for
      // the underline-by-status view in reading clients.
      async list(query: PaginationQuery = { limit: 50 }) {
        return request("GET", "/v1/known-words", PaginatedKnownWordSchema, {
          query: { limit: query.limit, cursor: query.cursor },
        });
      },
    },

    stats: {
      async heatmap(query: HeatmapQuery) {
        return request("GET", "/v1/stats/heatmap", HeatmapResponseSchema, {
          query: { year: query.year },
        });
      },
      async retention() {
        return request("GET", "/v1/stats/retention", RetentionResponseSchema);
      },
      async daily(query: DailyCountQuery) {
        return request("GET", "/v1/stats/daily", DailyCountResponseSchema, {
          query: { from: query.from, to: query.to },
        });
      },
    },

    ai: {
      // Discovery: is the user's OpenRouter key configured server-side?
      // Hit this on app start before surfacing AI-dependent UI.
      async key() {
        return request("GET", "/v1/ai/key", ClientAiStatusSchema);
      },
      // OpenRouter chat completions, proxied. Returns the raw Response
      // so the caller can stream from res.body (when stream:true) or
      // call res.json() (when stream:false).
      async chatCompletions(body: Record<string, unknown>) {
        return requestRaw("POST", "/v1/ai/chat/completions", { body });
      },
      audio: {
        async transcriptions(body: Record<string, unknown>): Promise<unknown> {
          const res = await requestRaw("POST", "/v1/ai/audio/transcriptions", { body });
          return res.json();
        },
        // Returns the raw audio bytes (MP3 by default).
        async speech(body: Record<string, unknown>): Promise<Uint8Array> {
          const res = await requestRaw("POST", "/v1/ai/audio/speech", { body });
          return new Uint8Array(await res.arrayBuffer());
        },
      },
    },
  };
}

export type HibiClient = ReturnType<typeof createHibiClient>;
