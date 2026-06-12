"use server";

import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets, bookings } from "@/lib/db/schema";

export type CategoryUtilization = {
  category: string;
  total: number;
  available: number;
  inUse: number;
  utilization: number;
};

export type AnalyticsData = {
  totalAssets: number;
  totalUnits: number;
  activeBookings: number;
  pendingBookings: number;
  overdueReturns: number;
  utilizationRate: number;
  categoryUtilization: CategoryUtilization[];
  overdueBookings: Array<{
    id: string;
    assetName: string;
    userName: string;
    endDate: Date;
    quantityRequested: number;
  }>;
};

export async function getAnalytics(): Promise<AnalyticsData> {
  const [[totalAssetsRow], [activeBookingsRow], [pendingBookingsRow], allAssets, approvedBookings] =
    await Promise.all([
      db.select({ value: count() }).from(assets),
      db.select({ value: count() }).from(bookings).where(eq(bookings.status, "Approved")),
      db.select({ value: count() }).from(bookings).where(eq(bookings.status, "Pending")),
      db.query.assets.findMany(),
      db.query.bookings.findMany({
        where: eq(bookings.status, "Approved"),
        with: { asset: true, user: true },
      }),
    ]);

  const now = new Date();
  const overdue = approvedBookings.filter((b) => b.endDate < now);

  const totalUnits = allAssets.reduce((acc, a) => acc + a.quantityTotal, 0);
  const availableUnits = allAssets.reduce((acc, a) => acc + a.quantityAvailable, 0);
  const utilizationRate =
    totalUnits > 0 ? Math.round(((totalUnits - availableUnits) / totalUnits) * 100) : 0;

  const categoryMap = new Map<string, { total: number; available: number }>();
  for (const asset of allAssets) {
    const entry = categoryMap.get(asset.category) ?? { total: 0, available: 0 };
    entry.total += asset.quantityTotal;
    entry.available += asset.quantityAvailable;
    categoryMap.set(asset.category, entry);
  }

  const categoryUtilization: CategoryUtilization[] = Array.from(categoryMap.entries())
    .map(([category, { total, available }]) => ({
      category,
      total,
      available,
      inUse: total - available,
      utilization: total > 0 ? Math.round(((total - available) / total) * 100) : 0,
    }))
    .sort((a, b) => b.utilization - a.utilization);

  return {
    totalAssets: totalAssetsRow?.value ?? 0,
    totalUnits,
    activeBookings: activeBookingsRow?.value ?? 0,
    pendingBookings: pendingBookingsRow?.value ?? 0,
    overdueReturns: overdue.length,
    utilizationRate,
    categoryUtilization,
    overdueBookings: overdue.map((b) => ({
      id: b.id,
      assetName: b.asset.name,
      userName: b.user.name,
      endDate: b.endDate,
      quantityRequested: b.quantityRequested,
    })),
  };
}
