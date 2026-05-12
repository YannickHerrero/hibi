import { z } from "zod";
import { TimestampSchema, UUIDSchema } from "./common.ts";

export const FuriganaPairSchema = z.object({
  base: z.string(),
  reading: z.string(),
});
export type FuriganaPair = z.infer<typeof FuriganaPairSchema>;

export const KanjiEntrySchema = z.object({
  kanji: z.string().length(1),
  meaning: z.string(),
  wanikaniLevel: z.number().int().min(1).max(60).nullable(),
});
export type KanjiEntry = z.infer<typeof KanjiEntrySchema>;

export const CardSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,

  sentence: z.string().min(1),
  focusWord: z.string().min(1),
  focusWordReading: z.string().min(1),
  furigana: z.array(FuriganaPairSchema),
  english: z.string(),
  glosses: z.array(z.string()),
  grammarNote: z.string().nullable(),
  kanjiList: z.array(KanjiEntrySchema),

  imageKey: z.string().nullable(),
  audioKey: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  audioUrl: z.string().url().nullable(),

  source: z.string(),
  tags: z.array(z.string()),
});
export type Card = z.infer<typeof CardSchema>;

export const CreateCardInputSchema = CardSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  imageUrl: true,
  audioUrl: true,
});
export type CreateCardInput = z.infer<typeof CreateCardInputSchema>;

export const UpdateCardInputSchema = CreateCardInputSchema.partial();
export type UpdateCardInput = z.infer<typeof UpdateCardInputSchema>;

export const ListCardsSortSchema = z.enum(["newest", "oldest", "due-soonest"]);
export type ListCardsSort = z.infer<typeof ListCardsSortSchema>;

export const ListCardsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),
  tag: z.string().optional(),
  source: z.string().optional(),
  q: z.string().min(1).max(200).optional(),
  sort: ListCardsSortSchema.default("newest"),
});
export type ListCardsQuery = z.infer<typeof ListCardsQuerySchema>;
