import { doublePrecision, index, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { cardStateEnum } from "./card-states.ts";
import { cards } from "./cards.ts";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),

    rating: integer("rating").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull().defaultNow(),
    elapsedDays: doublePrecision("elapsed_days").notNull(),
    scheduledDays: doublePrecision("scheduled_days").notNull(),
    stateBefore: cardStateEnum("state_before").notNull(),
    stateAfter: cardStateEnum("state_after").notNull(),
  },
  (table) => [
    index("reviews_user_reviewed_idx").on(table.userId, table.reviewedAt),
    index("reviews_card_id_idx").on(table.cardId),
  ],
);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type ReviewRating = 1 | 2 | 3 | 4;
