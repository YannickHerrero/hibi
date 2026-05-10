import { z } from "zod";
import { TimestampSchema, UUIDSchema } from "./common.ts";

// Free-form per-app context (e.g. { trackId } for Hibi Koe). Keep as
// a record so future apps can attach their own keys without a type bump.
export const SessionMetadataSchema = z.record(z.string(), z.unknown()).nullable();

export const SessionSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  kind: z.string().min(1),
  source: z.string().min(1),
  startedAt: TimestampSchema,
  endedAt: TimestampSchema,
  durationMs: z.number().int().nonnegative(),
  metadata: SessionMetadataSchema,
  createdAt: TimestampSchema,
});
export type Session = z.infer<typeof SessionSchema>;

export const CreateSessionInputSchema = SessionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  metadata: SessionMetadataSchema.optional(),
});
export type CreateSessionInput = z.infer<typeof CreateSessionInputSchema>;

export const ListSessionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),
  kind: z.string().optional(),
  source: z.string().optional(),
  // Inclusive lower bound, exclusive upper. Both ISO-8601 timestamps.
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
});
export type ListSessionsQuery = z.infer<typeof ListSessionsQuerySchema>;
