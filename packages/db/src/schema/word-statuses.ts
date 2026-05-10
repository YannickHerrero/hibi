import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// Per-user word status — the user's manual classification of a word.
// Keyed by (lemma, reading) so inflected forms collapse to a single
// status. Status values are kept open as text so adding new states
// doesn't require a migration; the type union lives in @hibi/types.
//
// Pairs with card_states at /v1/known-words: the merged endpoint
// returns the union of these manual rows and SRS-derived classifications
// from a user's cards (interval > 14d in 'review' ⇒ known, otherwise
// learning). When the same (lemma, reading) is in both sets, SRS wins.
export const wordStatuses = pgTable(
  "word_statuses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    lemma: text("lemma").notNull(),
    reading: text("reading").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("word_statuses_user_lemma_reading_uq").on(
      table.userId,
      table.lemma,
      table.reading,
    ),
    index("word_statuses_user_id_idx").on(table.userId),
  ],
);

export type WordStatusRow = typeof wordStatuses.$inferSelect;
export type NewWordStatusRow = typeof wordStatuses.$inferInsert;
