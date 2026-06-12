import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["Admin", "Consumer"]);
export const assetStatusEnum = pgEnum("asset_status", [
  "Available",
  "Unavailable",
  "Maintenance",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "Pending",
  "Approved",
  "Rejected",
  "Returned",
]);
export const assetConditionEnum = pgEnum("asset_condition", [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Damaged",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "Info",
  "Success",
  "Warning",
  "Error",
]);

// ---------------------------------------------------------------------------
// Users (also serves as the Auth.js adapter "users" table)
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: roleEnum("role").notNull().default("Consumer"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Auth.js adapter tables (accounts / sessions / verification tokens)
// ---------------------------------------------------------------------------
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ---------------------------------------------------------------------------
// Password reset tokens (for "Forgot password" email flow)
// ---------------------------------------------------------------------------
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  quantityTotal: integer("quantity_total").notNull().default(1),
  quantityAvailable: integer("quantity_available").notNull().default(1),
  status: assetStatusEnum("status").notNull().default("Available"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  quantityRequested: integer("quantity_requested").notNull(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  status: bookingStatusEnum("status").notNull().default("Pending"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
});

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull().default("Info"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Asset Health
// ---------------------------------------------------------------------------
export const assetHealth = pgTable("asset_health", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  condition: assetConditionEnum("condition").notNull().default("Good"),
  maintenanceHistory: text("maintenance_history"),
  lastCheckedAt: timestamp("last_checked_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  auditLogs: many(auditLogs),
  passwordResetTokens: many(passwordResetTokens),
  notifications: many(notifications),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  bookings: many(bookings),
  healthRecords: many(assetHealth),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  asset: one(assets, { fields: [bookings.assetId], references: [assets.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const assetHealthRelations = relations(assetHealth, ({ one }) => ({
  asset: one(assets, { fields: [assetHealth.assetId], references: [assets.id] }),
}));

export type User = typeof users.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type AssetHealth = typeof assetHealth.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
