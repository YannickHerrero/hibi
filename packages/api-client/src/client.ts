import {
  CardSchema,
  type CreateCardInput,
  CreateCardInputSchema,
  type DailyCountQuery,
  DailyCountResponseSchema,
  type HeatmapQuery,
  HeatmapResponseSchema,
  type ListCardsQuery,
  PaginatedSchema,
  RetentionResponseSchema,
  type SubmitReviewInput,
  SubmitReviewInputSchema,
  SubmitReviewResultSchema,
  type UpdateCardInput,
  UpdateCardInputSchema,
} from "@hibi/types";
import { z } from "zod";

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
const DueResponseSchema = z.object({
  items: z.array(
    z.object({ card: CardSchema, cardState: SubmitReviewResultSchema.shape.cardState }),
  ),
});
const UploadAudioResponseSchema = z.object({ key: z.string() });

// React-Native-style file reference. RN's FormData.append accepts this
// shape directly; we type it explicitly so consumers can build it
// without depending on RN-specific globals.
export type RNFileRef = { uri: string; name: string; type: string };

// What client.uploads.audio() accepts. On web pass a Blob/File; on RN
// pass an RNFileRef. In both cases the SDK builds the multipart body.
export type AudioUploadInput = Blob | RNFileRef;

function asError(status: number, body: unknown): HibiClientError {
  const err = new Error(`Hibi API error: ${status}`) as HibiClientError;
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
    const body = text ? JSON.parse(text) : null;

    if (!res.ok) throw asError(res.status, body);
    return schema.parse(body);
  }

  function buildAudioForm(input: AudioUploadInput): FormData {
    const fd = new FormData();
    if (typeof Blob !== "undefined" && input instanceof Blob) {
      // Blob/File on web/node20+. Pass a name so the server sees a filename.
      const name = "name" in input && typeof input.name === "string" ? input.name : "clip.m4a";
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
      async list(query: ListCardsQuery = { limit: 50 }) {
        return request("GET", "/v1/cards", PaginatedCardSchema, {
          query: { limit: query.limit, cursor: query.cursor, tag: query.tag, source: query.source },
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
      async audio(input: AudioUploadInput) {
        return request("POST", "/v1/uploads/audio", UploadAudioResponseSchema, {
          body: buildAudioForm(input),
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
  };
}

export type HibiClient = ReturnType<typeof createHibiClient>;
