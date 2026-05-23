import { z } from "zod";
import { TimestampSchema, UUIDSchema } from "./common.ts";

export const AccountSchema = z.object({
  id: UUIDSchema,
  email: z.email(),
  createdAt: TimestampSchema,
});
export type Account = z.infer<typeof AccountSchema>;

export const ApiKeySchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1).max(80),
  lastUsedAt: TimestampSchema.nullable(),
  createdAt: TimestampSchema,
  revokedAt: TimestampSchema.nullable(),
});
export type ApiKey = z.infer<typeof ApiKeySchema>;

export const CreateApiKeyInputSchema = z.object({
  name: z.string().min(1).max(80),
});
export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInputSchema>;

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeySchema,
  rawKey: z.string(),
});
export type CreateApiKeyResponse = z.infer<typeof CreateApiKeyResponseSchema>;

export const SaveOpenRouterKeyInputSchema = z.object({
  apiKey: z.string().min(1).max(512),
});
export type SaveOpenRouterKeyInput = z.infer<typeof SaveOpenRouterKeyInputSchema>;

// Returned by PUT /v1/account/openrouter-key after a successful probe.
// Mirrors the fields OpenRouter's GET /auth/key exposes.
export const OpenRouterKeyInfoSchema = z.object({
  label: z.string(),
  usage: z.number().nullable(),
  limit: z.number().nullable(),
});
export type OpenRouterKeyInfo = z.infer<typeof OpenRouterKeyInfoSchema>;

export const OpenRouterKeyStatusSchema = z.object({
  configured: z.boolean(),
  keyLabel: z.string().nullable().optional(),
  updatedAt: TimestampSchema.nullable().optional(),
});
export type OpenRouterKeyStatus = z.infer<typeof OpenRouterKeyStatusSchema>;
