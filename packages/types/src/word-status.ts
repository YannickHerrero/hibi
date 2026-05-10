import { z } from "zod";
import { TimestampSchema, UUIDSchema } from "./common.ts";

// Three writeable values. 'unknown' is the implicit default and is
// represented by the absence of a row, never stored explicitly.
export const WordStatusSchema = z.enum(["learning", "known", "ignored"]);
export type WordStatus = z.infer<typeof WordStatusSchema>;

// Manual word-status row as the user set it. (lemma, reading) is unique
// per-user; updating with the same key overwrites status + updatedAt.
export const ManualWordStatusSchema = z.object({
  id: UUIDSchema,
  lemma: z.string().min(1),
  reading: z.string().min(1),
  status: WordStatusSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type ManualWordStatus = z.infer<typeof ManualWordStatusSchema>;

// PUT /v1/word-status body. status: null deletes the row.
export const SetWordStatusInputSchema = z.object({
  lemma: z.string().min(1),
  reading: z.string().min(1),
  status: WordStatusSchema.nullable(),
});
export type SetWordStatusInput = z.infer<typeof SetWordStatusInputSchema>;

// One row in the merged /v1/known-words response. source distinguishes
// manual marks from SRS-derived classifications. When source is 'srs',
// cardId + intervalDays are populated; clients should treat the status
// as read-only and tell users to adjust by reviewing the card.
export const KnownWordSchema = z.object({
  lemma: z.string(),
  reading: z.string(),
  status: WordStatusSchema,
  source: z.enum(["manual", "srs"]),
  cardId: UUIDSchema.nullable(),
  intervalDays: z.number().int().nullable(),
  updatedAt: TimestampSchema,
});
export type KnownWord = z.infer<typeof KnownWordSchema>;
