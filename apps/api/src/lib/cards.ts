import type { cards } from "@hibi/db/schema";
import { signedMediaUrl, signedMediaUrls } from "./storage.ts";

type CardRow = typeof cards.$inferSelect;

function toBase(row: CardRow) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function serializeCardWithUrls(row: CardRow) {
  const [audioUrl, imageUrl] = await Promise.all([
    row.audioKey ? signedMediaUrl(row.audioKey) : Promise.resolve(null),
    row.imageKey ? signedMediaUrl(row.imageKey) : Promise.resolve(null),
  ]);
  return { ...toBase(row), audioUrl, imageUrl };
}

export async function serializeCardsWithUrls(rows: CardRow[]) {
  const allKeys = rows.flatMap((r) =>
    [r.audioKey, r.imageKey].filter((k): k is string => k !== null),
  );
  const urls = await signedMediaUrls(allKeys);
  return rows.map((row) => ({
    ...toBase(row),
    audioUrl: row.audioKey ? (urls.get(row.audioKey) ?? null) : null,
    imageUrl: row.imageKey ? (urls.get(row.imageKey) ?? null) : null,
  }));
}
