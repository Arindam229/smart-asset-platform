"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assets, auditLogs, bookings } from "@/lib/db/schema";
// withTransaction removed in favor of optimistic concurrency control

export type ActionState = { error?: string; success?: string } | null;

export async function getAvailableAssets() {
  return db.query.assets.findMany({
    orderBy: (a, { asc }) => [asc(a.category), asc(a.name)],
  });
}

export async function getMyBookings() {
  const session = await auth();
  if (!session?.user) return [];

  return db.query.bookings.findMany({
    where: eq(bookings.userId, session.user.id),
    with: { asset: true },
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
}

export async function requestBooking(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in to request a booking." };
  }

  const assetId = String(formData.get("assetId") ?? "");
  const quantityRequested = Number(formData.get("quantityRequested"));
  const startDate = new Date(String(formData.get("startDate") ?? ""));
  const endDate = new Date(String(formData.get("endDate") ?? ""));

  if (!assetId || !Number.isFinite(quantityRequested) || quantityRequested <= 0) {
    return { error: "Please enter a valid quantity to request." };
  }
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    return { error: "Please choose a valid start and end date." };
  }

  try {
    // Fetch the asset
    const asset = await db.query.assets.findFirst({
      where: eq(assets.id, assetId)
    });

    if (!asset) {
      throw new Error("Asset not found.");
    }
    if (asset.status !== "Available") {
      throw new Error(`"${asset.name}" is not currently available for booking.`);
    }
    if (asset.quantityAvailable < quantityRequested) {
      throw new Error(
        `Only ${asset.quantityAvailable} unit(s) of "${asset.name}" remain in stock.`
      );
    }

    // Atomically decrement the available stock using optimistic concurrency control.
    // This entirely avoids the need for a full Postgres transaction over WebSockets.
    const updated = await db
      .update(assets)
      .set({
        quantityAvailable: asset.quantityAvailable - quantityRequested,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(assets.id, assetId),
          gte(assets.quantityAvailable, quantityRequested)
        )
      )
      .returning({ id: assets.id });

    if (updated.length === 0) {
      throw new Error(
        `Failed to book. Someone else may have just booked "${asset.name}". Please try again.`
      );
    }

    // Insert the booking
    await db.insert(bookings).values({
      userId: session.user.id,
      assetId,
      quantityRequested,
      startDate,
      endDate,
      status: "Pending",
    });

    // Insert audit log
    await db.insert(auditLogs).values({
      action: `Requested ${quantityRequested}x "${asset.name}"`,
      userId: session.user.id,
    });
  } catch (error: any) {
    console.error("DEBUG Booking Error:", error);
    return {
      error: error?.message || String(error) || "Unable to submit booking request.",
    };
  }

  revalidatePath("/dashboard/consumer");
  revalidatePath("/dashboard/admin/approvals");
  revalidatePath("/dashboard/analytics");

  return { success: "Booking request submitted for approval." };
}
