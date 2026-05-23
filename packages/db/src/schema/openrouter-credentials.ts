import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const openrouterCredentials = pgTable("openrouter_credentials", {
  userId: uuid("user_id").primaryKey(),
  encryptedKey: text("encrypted_key").notNull(),
  keyLabel: text("key_label"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OpenrouterCredential = typeof openrouterCredentials.$inferSelect;
export type NewOpenrouterCredential = typeof openrouterCredentials.$inferInsert;
