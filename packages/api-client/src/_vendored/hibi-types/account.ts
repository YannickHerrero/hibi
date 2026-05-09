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
