import { z } from "zod";
import { TimestampSchema, UUIDSchema } from "./common.ts";

export const CardStateSchema = z.enum(["new", "learning", "review", "relearning"]);
export type CardStateValue = z.infer<typeof CardStateSchema>;

export const ReviewRatingSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
export type ReviewRating = z.infer<typeof ReviewRatingSchema>;

export const ReviewSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  cardId: UUIDSchema,
  rating: ReviewRatingSchema,
  reviewedAt: TimestampSchema,
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  stateBefore: CardStateSchema,
  stateAfter: CardStateSchema,
});
export type Review = z.infer<typeof ReviewSchema>;

export const CardStateRowSchema = z.object({
  cardId: UUIDSchema,
  userId: UUIDSchema,
  due: TimestampSchema,
  stability: z.number(),
  difficulty: z.number(),
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  state: CardStateSchema,
  lastReview: TimestampSchema.nullable(),
});
export type CardStateRow = z.infer<typeof CardStateRowSchema>;

export const DueReviewsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  before: TimestampSchema.optional(),
});
export type DueReviewsQuery = z.infer<typeof DueReviewsQuerySchema>;

export const SubmitReviewInputSchema = z.object({
  cardId: UUIDSchema,
  rating: ReviewRatingSchema,
  reviewedAt: TimestampSchema.optional(),
});
export type SubmitReviewInput = z.infer<typeof SubmitReviewInputSchema>;

export const SubmitReviewResultSchema = z.object({
  review: ReviewSchema,
  cardState: CardStateRowSchema,
});
export type SubmitReviewResult = z.infer<typeof SubmitReviewResultSchema>;
