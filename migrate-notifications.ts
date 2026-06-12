import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("Creating notification_type enum...");
  await db.execute(
    `DO $$ BEGIN
      CREATE TYPE "notification_type" AS ENUM('Info', 'Success', 'Warning', 'Error');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`
  );

  console.log("Creating notifications table...");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "notifications" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "title" text NOT NULL,
      "message" text NOT NULL,
      "type" "notification_type" DEFAULT 'Info' NOT NULL,
      "read" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  console.log("Adding foreign key constraint...");
  await db.execute(`
    DO $$ BEGIN
      ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log("Migration completed.");
}

main().catch(console.error);
