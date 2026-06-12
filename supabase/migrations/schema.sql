-- =============================================================================
-- Smart Asset Management & Resource Allocation Platform
-- Initial schema migration for Neon Serverless PostgreSQL
-- =============================================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type "role" as enum ('Admin', 'Consumer');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type "asset_status" as enum ('Available', 'Unavailable', 'Maintenance');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type "booking_status" as enum ('Pending', 'Approved', 'Rejected', 'Returned');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type "asset_condition" as enum ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged');
exception
  when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
create table if not exists "users" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "email" text not null unique,
  "email_verified" timestamp,
  "image" text,
  "password_hash" text,
  "role" "role" not null default 'Consumer',
  "created_at" timestamp not null default now()
);

-- Nullable for users created via OAuth providers (e.g. Google), who have no password.
alter table "users" alter column "password_hash" drop not null;

-- -----------------------------------------------------------------------------
-- accounts / sessions / verification_tokens (Auth.js adapter tables)
-- -----------------------------------------------------------------------------
create table if not exists "accounts" (
  "user_id" uuid not null references "users"("id") on delete cascade,
  "type" text not null,
  "provider" text not null,
  "provider_account_id" text not null,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  primary key ("provider", "provider_account_id")
);

create table if not exists "sessions" (
  "session_token" text primary key,
  "user_id" uuid not null references "users"("id") on delete cascade,
  "expires" timestamp not null
);

create table if not exists "verification_tokens" (
  "identifier" text not null,
  "token" text not null,
  "expires" timestamp not null,
  primary key ("identifier", "token")
);

-- -----------------------------------------------------------------------------
-- password_reset_tokens ("Forgot password" email flow)
-- -----------------------------------------------------------------------------
create table if not exists "password_reset_tokens" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "token_hash" text not null unique,
  "expires_at" timestamp not null,
  "created_at" timestamp not null default now()
);

create index if not exists "password_reset_tokens_user_id_idx" on "password_reset_tokens" ("user_id");

-- -----------------------------------------------------------------------------
-- assets
-- -----------------------------------------------------------------------------
create table if not exists "assets" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "category" text not null,
  "description" text,
  "quantity_total" integer not null default 1,
  "quantity_available" integer not null default 1,
  "status" "asset_status" not null default 'Available',
  "image_url" text,
  "created_at" timestamp not null default now(),
  "updated_at" timestamp not null default now(),
  constraint "quantity_available_nonnegative" check ("quantity_available" >= 0),
  constraint "quantity_available_lte_total" check ("quantity_available" <= "quantity_total")
);

create index if not exists "assets_category_idx" on "assets" ("category");
create index if not exists "assets_status_idx" on "assets" ("status");

-- -----------------------------------------------------------------------------
-- bookings
-- -----------------------------------------------------------------------------
create table if not exists "bookings" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "asset_id" uuid not null references "assets"("id") on delete cascade,
  "quantity_requested" integer not null,
  "start_date" timestamp not null,
  "end_date" timestamp not null,
  "status" "booking_status" not null default 'Pending',
  "created_at" timestamp not null default now(),
  constraint "quantity_requested_positive" check ("quantity_requested" > 0),
  constraint "end_after_start" check ("end_date" > "start_date")
);

create index if not exists "bookings_user_id_idx" on "bookings" ("user_id");
create index if not exists "bookings_asset_id_idx" on "bookings" ("asset_id");
create index if not exists "bookings_status_idx" on "bookings" ("status");

-- -----------------------------------------------------------------------------
-- audit_logs
-- -----------------------------------------------------------------------------
create table if not exists "audit_logs" (
  "id" uuid primary key default gen_random_uuid(),
  "action" text not null,
  "details" text,
  "timestamp" timestamp not null default now(),
  "user_id" uuid references "users"("id") on delete set null
);

create index if not exists "audit_logs_user_id_idx" on "audit_logs" ("user_id");
create index if not exists "audit_logs_timestamp_idx" on "audit_logs" ("timestamp");

-- -----------------------------------------------------------------------------
-- asset_health
-- -----------------------------------------------------------------------------
create table if not exists "asset_health" (
  "id" uuid primary key default gen_random_uuid(),
  "asset_id" uuid not null references "assets"("id") on delete cascade,
  "condition" "asset_condition" not null default 'Good',
  "maintenance_history" text,
  "last_checked_at" timestamp not null default now()
);

create index if not exists "asset_health_asset_id_idx" on "asset_health" ("asset_id");

-- -----------------------------------------------------------------------------
-- Seed data (optional, useful for local development)
-- -----------------------------------------------------------------------------

-- Demo admin account: admin@assetflow.io / admin12345
insert into "users" ("name", "email", "password_hash", "role")
values
  ('Demo Admin', 'admin@assetflow.io', '$2b$10$bSJiTc8cO3OXq55PxnWrd.c0Ri.t8hg/0ci8dkK3uG8ni2YPxRRW.', 'Admin')
on conflict ("email") do nothing;

insert into "assets" ("name", "category", "description", "quantity_total", "quantity_available", "status")
values
  ('MacBook Pro 16"', 'Electronics', 'M3 Max laptop for engineering and design work.', 10, 7, 'Available'),
  ('Canon EOS R5', 'Photography', 'Full-frame mirrorless camera with 8K video.', 4, 2, 'Available'),
  ('Conference Room Projector', 'Office Equipment', '4K laser projector with HDMI/USB-C.', 3, 3, 'Available'),
  ('Herman Miller Aeron Chair', 'Furniture', 'Ergonomic office chair, size B.', 20, 15, 'Available'),
  ('DJI Mavic 3 Drone', 'Photography', 'Professional aerial drone with 4/3 CMOS sensor.', 2, 0, 'Unavailable'),
  ('Standing Desk', 'Furniture', 'Electric height-adjustable desk.', 15, 12, 'Available'),
  ('Portable Generator 5kW', 'Field Equipment', 'Petrol generator for remote site operations.', 5, 1, 'Maintenance'),
  ('iPad Pro 12.9"', 'Electronics', 'M2 tablet with Apple Pencil support.', 12, 9, 'Available')
on conflict do nothing;
