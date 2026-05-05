import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export interface FuriganaPair {
  base: string;
  reading: string;
}

export interface KanjiEntry {
  kanji: string;
  meaning: string;
  wanikaniLevel: number | null;
}

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

    sentence: text("sentence").notNull(),
    focusWord: text("focus_word").notNull(),
    focusWordReading: text("focus_word_reading").notNull(),
    furigana: jsonb("furigana").$type<FuriganaPair[]>().notNull(),
    english: text("english").notNull(),
    glosses: text("glosses").array().notNull(),
    grammarNote: text("grammar_note"),
    kanjiList: jsonb("kanji_list").$type<KanjiEntry[]>().notNull(),

    imageKey: text("image_key"),
    audioKey: text("audio_key"),

    source: text("source").notNull(),
    tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  },
  (table) => [
    index("cards_user_id_idx").on(table.userId),
    index("cards_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
