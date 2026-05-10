import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Generic per-user time-tracking row. `kind` describes the activity
// ("passive-listening", future "reading", "active-immersion") and
// `source` is the app slug that produced it ("hibi-koe", future
// "hibi-mado", etc.). Future apps can post their own sessions without
// needing a schema change.
//
// `metadata` is intentionally free-form JSONB so per-app context
// (trackId on Hibi Koe, deckId on a reading app, etc.) can ride along
// without polluting the columns.
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    kind: text("kind").notNull(),
    source: text("source").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
    // Persisted (not derived) so range queries don't have to recompute
    // and rounding stays consistent across clients.
    durationMs: integer("duration_ms").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sessions_user_kind_started_idx").on(table.userId, table.kind, table.startedAt),
    index("sessions_user_source_started_idx").on(table.userId, table.source, table.startedAt),
  ],
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
