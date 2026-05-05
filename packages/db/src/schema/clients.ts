import { bigint, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    apiKeyId: uuid("api_key_id"),

    name: text("name").notNull(),
    platform: text("platform"),
    version: text("version"),

    requestCount: bigint("request_count", { mode: "number" }).notNull().default(0),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("clients_user_id_idx").on(table.userId)],
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
