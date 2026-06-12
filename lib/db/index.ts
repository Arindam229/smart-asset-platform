import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

// Falls back to a placeholder connection string during build-time module
// evaluation (e.g. `next build` page-data collection), where `DATABASE_URL`
// is not yet available. `neon()` throws on an empty string but never
// connects until a query actually runs, so this is safe — real requests
// always carry the real `DATABASE_URL`.
const sql = neon(process.env.DATABASE_URL || "postgresql://user:pass@localhost/db");

export const db = global.__db ?? drizzle(sql, { schema });

if (process.env.NODE_ENV !== "production") {
  global.__db = db;
}

export * from "./schema";
