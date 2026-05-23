import { z } from "zod";

// Returned by GET /v1/ai/key (client API-key authed). The discovery
// endpoint for AI features: lets a client decide whether to surface
// the "configure OpenRouter in portal" prompt before invoking proxy
// routes.
export const ClientAiStatusSchema = z.discriminatedUnion("configured", [
  z.object({
    configured: z.literal(true),
    label: z.string(),
    usage: z.number().nullable(),
    limit: z.number().nullable(),
  }),
  z.object({
    configured: z.literal(false),
  }),
]);
export type ClientAiStatus = z.infer<typeof ClientAiStatusSchema>;
