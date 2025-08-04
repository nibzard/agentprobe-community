import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Database = D1Database;
export type DrizzleD1 = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(d1: Database): DrizzleD1 {
  return drizzle(d1, { schema });
}

export * from './schema';