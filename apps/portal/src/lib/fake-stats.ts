import type {
  DailyCount,
  HeatmapDay,
  HeatmapResponse,
  RetentionPoint,
  RetentionResponse,
} from "@hibi/types";

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function isLeap(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function fakeHeatmap(year: number): HeatmapResponse {
  const rand = seededRandom(year * 31);
  const totalDays = isLeap(year) ? 366 : 365;
  const days: HeatmapDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(Date.UTC(year, 0, 1 + i));
    if (d > new Date()) break;
    const date = d.toISOString().slice(0, 10);
    const weekday = d.getUTCDay();
    const seasonal = 12 + 6 * Math.sin(i / 18);
    const weekendDip = weekday === 0 || weekday === 6 ? -4 : 0;
    const noise = rand() * 8 - 2;
    const skipDay = rand() < 0.08;
    const count = skipDay ? 0 : Math.max(0, Math.round(seasonal + weekendDip + noise));
    days.push({ date, count });
  }

  return { year, days };
}

export function fakeRetention(): RetentionResponse {
  const intervals = [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 120];
  const points: RetentionPoint[] = intervals.map((d, i) => {
    const decay = Math.exp(-d / 80);
    const retention = Math.max(0.6, Math.min(0.99, 0.92 * decay + 0.06));
    const sampleSize = Math.max(40, 280 - i * 14);
    return { intervalDays: d, retention, sampleSize };
  });
  return { generatedAt: new Date().toISOString(), points };
}

export function fakeDailyToday(): DailyCount {
  const today = new Date().toISOString().slice(0, 10);
  return { date: today, reviews: 47, again: 6, hard: 9, good: 28, easy: 4 };
}

export interface FakeOverview {
  dueNow: number;
  reviewsToday: number;
  streakDays: number;
  totalCards: number;
}

export function fakeOverview(): FakeOverview {
  return { dueNow: 23, reviewsToday: 47, streakDays: 18, totalCards: 1284 };
}

export const HEATMAP_YEARS_OFFERED = (() => {
  const current = new Date().getUTCFullYear();
  return [current - 2, current - 1, current];
})();
