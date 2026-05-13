import { z } from "zod";
import { TimestampSchema } from "./common.ts";

export const HeatmapDaySchema = z.object({
  date: z.iso.date(),
  count: z.number().int().nonnegative(),
});
export type HeatmapDay = z.infer<typeof HeatmapDaySchema>;

export const HeatmapQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});
export type HeatmapQuery = z.infer<typeof HeatmapQuerySchema>;

export const HeatmapResponseSchema = z.object({
  year: z.number().int(),
  days: z.array(HeatmapDaySchema),
});
export type HeatmapResponse = z.infer<typeof HeatmapResponseSchema>;

export const RetentionPointSchema = z.object({
  intervalDays: z.number().int().nonnegative(),
  retention: z.number().min(0).max(1),
  sampleSize: z.number().int().nonnegative(),
});
export type RetentionPoint = z.infer<typeof RetentionPointSchema>;

export const RetentionResponseSchema = z.object({
  generatedAt: TimestampSchema,
  points: z.array(RetentionPointSchema),
});
export type RetentionResponse = z.infer<typeof RetentionResponseSchema>;

export const DailyCountQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});
export type DailyCountQuery = z.infer<typeof DailyCountQuerySchema>;

export const DailyCountSchema = z.object({
  date: z.iso.date(),
  reviews: z.number().int().nonnegative(),
  again: z.number().int().nonnegative(),
  hard: z.number().int().nonnegative(),
  good: z.number().int().nonnegative(),
  easy: z.number().int().nonnegative(),
});
export type DailyCount = z.infer<typeof DailyCountSchema>;

export const DailyCountResponseSchema = z.object({
  days: z.array(DailyCountSchema),
});
export type DailyCountResponse = z.infer<typeof DailyCountResponseSchema>;

export const OverviewResponseSchema = z.object({
  dueNow: z.number().int().nonnegative(),
  reviewsToday: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  totalCards: z.number().int().nonnegative(),
});
export type OverviewResponse = z.infer<typeof OverviewResponseSchema>;
