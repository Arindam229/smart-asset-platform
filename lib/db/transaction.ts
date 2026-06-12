import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

type TxClient = Parameters<
  Parameters<NeonDatabase<typeof schema>["transaction"]>[0]
>[0];

/**
 * Runs `callback` inside a real, isolated Postgres transaction using the
 * WebSocket-based Neon driver (the HTTP driver used by `db` does not support
 * `BEGIN`/`COMMIT`). Used for the booking flow, where stock levels must be
 * read and decremented atomically with `SELECT ... FOR UPDATE`.
 */
export async function withTransaction<T>(
  callback: (tx: TxClient) => Promise<T>
): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
  const tdb = drizzle(pool, { schema });

  try {
    return await tdb.transaction(callback);
  } finally {
    await pool.end();
  }
}
