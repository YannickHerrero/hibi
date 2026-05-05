import { type Database, createDb } from "@hibi/db";
import { getEnv } from "./env.ts";

let instance: Database | null = null;

export function getDb(): Database {
  if (!instance) {
    instance = createDb(getEnv().DATABASE_URL);
  }
  return instance;
}
