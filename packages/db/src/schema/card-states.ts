import { doublePrecision, index, integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { cards } from "./cards.ts";

export const cardStateEnum = pgEnum("card_state", [
  "new",
  "learning",
  "review",
  "relearning",
]);

export const cardStates = pgTable(
  "card_states",
  {
    cardId: uuid("card_id")
      .primaryKey()
      .references(() => cards.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),

    due: timestamp("due", { withTimezone: true }).notNull(),
    stability: doublePrecision("stability").notNull(),
    difficulty: doublePrecision("difficulty").notNull(),
    elapsedDays: doublePrecision("elapsed_days").notNull().default(0),
    scheduledDays: doublePrecision("scheduled_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    state: cardStateEnum("state").notNull().default("new"),
    lastReview: timestamp("last_review", { withTimezone: true }),
  },
  (table) => [
    index("card_states_user_due_idx").on(table.userId, table.due),
    index("card_states_due_idx").on(table.due),
  ],
);

export type CardState = typeof cardStates.$inferSelect;
export type NewCardState = typeof cardStates.$inferInsert;
