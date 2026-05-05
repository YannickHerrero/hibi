// Client factory — populated once drizzle-orm is installed.
export type Database = unknown;

export function createDb(_databaseUrl: string): Database {
  throw new Error("createDb is not yet implemented — install drizzle-orm and postgres first.");
}
