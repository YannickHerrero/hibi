import type { Database } from "@hibi/db";
import { cards, cardStates, reviews } from "@hibi/db/schema";
import type {
  DailyCountResponse,
  HeatmapResponse,
  OverviewResponse,
  RetentionResponse,
} from "@hibi/types";
import { and, count, eq, gte, lt, lte, sql } from "drizzle-orm";

export async function heatmapByYear(
  db: Database,
  userId: string,
  year: number,
): Promise<HeatmapResponse> {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const dateExpr = sql<string>`to_char(${reviews.reviewedAt}, 'YYYY-MM-DD')`;

  const rows = await db
    .select({
      date: dateExpr.as("date"),
      count: sql<number>`COUNT(*)::int`.as("count"),
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewedAt, start),
        lt(reviews.reviewedAt, end),
      ),
    )
    .groupBy(dateExpr);

  return { year, days: rows };
}

export async function retentionCurve(
  db: Database,
  userId: string,
): Promise<RetentionResponse> {
  const intervalExpr = sql<number>`ROUND(${reviews.elapsedDays})::int`;

  const rows = await db
    .select({
      intervalDays: intervalExpr.as("interval_days"),
      retention: sql<number>`
        (COUNT(*) FILTER (WHERE ${reviews.rating} >= 3))::float
        / NULLIF(COUNT(*), 0)
      `.as("retention"),
      sampleSize: sql<number>`COUNT(*)::int`.as("sample_size"),
    })
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .groupBy(intervalExpr)
    .orderBy(intervalExpr);

  return {
    generatedAt: new Date().toISOString(),
    points: rows.map((r) => ({
      intervalDays: r.intervalDays,
      retention: r.retention ?? 0,
      sampleSize: r.sampleSize,
    })),
  };
}

export async function dailyCounts(
  db: Database,
  userId: string,
  from: string,
  to: string,
): Promise<DailyCountResponse> {
  const fromDate = new Date(`${from}T00:00:00Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);
  const dateExpr = sql<string>`to_char(${reviews.reviewedAt}, 'YYYY-MM-DD')`;

  const rows = await db
    .select({
      date: dateExpr.as("date"),
      reviews: sql<number>`COUNT(*)::int`.as("reviews"),
      again: sql<number>`COUNT(*) FILTER (WHERE ${reviews.rating} = 1)::int`.as("again"),
      hard: sql<number>`COUNT(*) FILTER (WHERE ${reviews.rating} = 2)::int`.as("hard"),
      good: sql<number>`COUNT(*) FILTER (WHERE ${reviews.rating} = 3)::int`.as("good"),
      easy: sql<number>`COUNT(*) FILTER (WHERE ${reviews.rating} = 4)::int`.as("easy"),
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewedAt, fromDate),
        lt(reviews.reviewedAt, toDate),
      ),
    )
    .groupBy(dateExpr)
    .orderBy(dateExpr);

  return { days: rows };
}

// UTC for v1 — per-user timezone is a follow-up.
export async function overview(
  db: Database,
  userId: string,
): Promise<OverviewResponse> {
  const now = new Date();
  const startOfTodayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dayExpr = sql<string>`to_char(${reviews.reviewedAt}, 'YYYY-MM-DD')`;

  const [dueRow, totalRow, todayRow, recentDays] = await Promise.all([
    db
      .select({ value: count() })
      .from(cardStates)
      .where(and(eq(cardStates.userId, userId), lte(cardStates.due, now))),
    db.select({ value: count() }).from(cards).where(eq(cards.userId, userId)),
    db
      .select({ value: count() })
      .from(reviews)
      .where(
        and(eq(reviews.userId, userId), gte(reviews.reviewedAt, startOfTodayUtc)),
      ),
    db
      .selectDistinct({ day: dayExpr })
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(sql`1 DESC`)
      .limit(400),
  ]);

  const reviewDays = new Set(recentDays.map((r) => r.day));
  const todayKey = startOfTodayUtc.toISOString().slice(0, 10);
  let streakDays = 0;
  const cursor = new Date(startOfTodayUtc);
  if (!reviewDays.has(todayKey)) {
    // Allow yesterday as the streak anchor so today's streak isn't lost before the first review.
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (reviewDays.has(cursor.toISOString().slice(0, 10))) {
    streakDays += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return {
    dueNow: dueRow[0]?.value ?? 0,
    reviewsToday: todayRow[0]?.value ?? 0,
    streakDays,
    totalCards: totalRow[0]?.value ?? 0,
  };
}
