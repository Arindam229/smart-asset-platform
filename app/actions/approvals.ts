"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assets, auditLogs, bookings, notifications } from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email";
import { sql } from "drizzle-orm";

export type ActionState = { error?: string; success?: string } | null;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

export async function getBookingQueue() {
  return db.query.bookings.findMany({
    with: {
      asset: true,
      user: { columns: { id: true, name: true, email: true, role: true } },
    },
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
}

export async function approveBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("bookingId") ?? "");
  if (!id) return { error: "Missing booking id." };
  return approveBooking(id);
}

export async function rejectBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("bookingId") ?? "");
  if (!id) return { error: "Missing booking id." };
  return rejectBooking(id);
}

export async function returnBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("bookingId") ?? "");
  if (!id) return { error: "Missing booking id." };
  return returnBooking(id);
}

export async function approveBooking(bookingId: string): Promise<ActionState> {
  const session = await requireAdmin();

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: { asset: true, user: true },
  });

  if (!booking) return { error: "Booking not found." };
  if (booking.status !== "Pending") {
    return { error: "Only pending bookings can be approved." };
  }

  await db.update(bookings).set({ status: "Approved" }).where(eq(bookings.id, bookingId));

  await db.insert(auditLogs).values({
    action: `Approved booking for "${booking.asset.name}" (${booking.quantityRequested}x)`,
    userId: session.user.id,
  });

  // Create in-app notification
  await db.insert(notifications).values({
    userId: booking.userId,
    title: "Booking Approved",
    message: `Your booking request for ${booking.quantityRequested}x "${booking.asset.name}" has been approved!`,
    type: "Success",
  });

  // Send email notification
  if (booking.user?.email) {
    await sendNotificationEmail({
      to: booking.user.email,
      subject: "AssetFlow - Booking Approved",
      html: `<p>Great news! Your booking request for <strong>${booking.quantityRequested}x "${booking.asset.name}"</strong> has been approved.</p>`,
    }).catch(console.error);
  }

  revalidatePath("/dashboard/admin/approvals");
  revalidatePath("/dashboard/consumer");
  revalidatePath("/dashboard/analytics");

  return { success: "Booking approved." };
}

export async function rejectBooking(bookingId: string): Promise<ActionState> {
  const session = await requireAdmin();

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: { asset: true, user: true },
  });

  if (!booking) return { error: "Booking not found." };
  if (booking.status !== "Pending") {
    return { error: "Only pending bookings can be rejected." };
  }

  try {
    await db.update(bookings).set({ status: "Rejected" }).where(eq(bookings.id, bookingId));

    // Release the reservation held against stock back into availability.
    await db
      .update(assets)
      .set({
        quantityAvailable: sql`${assets.quantityAvailable} + ${booking.quantityRequested}`,
        updatedAt: new Date(),
      })
      .where(eq(assets.id, booking.assetId));

    await db.insert(auditLogs).values({
      action: `Rejected booking for "${booking.asset.name}" (${booking.quantityRequested}x)`,
      userId: session.user.id,
    });

    // Create in-app notification
    await db.insert(notifications).values({
      userId: booking.userId,
      title: "Booking Rejected",
      message: `Your booking request for ${booking.quantityRequested}x "${booking.asset.name}" was rejected.`,
      type: "Error",
    });

    // Send email notification
    if (booking.user?.email) {
      await sendNotificationEmail({
        to: booking.user.email,
        subject: "AssetFlow - Booking Rejected",
        html: `<p>We're sorry, but your booking request for <strong>${booking.quantityRequested}x "${booking.asset.name}"</strong> has been rejected.</p>`,
      }).catch(console.error);
    }
  } catch (error) {
    console.error("Failed to reject booking:", error);
    return { error: "An error occurred while rejecting the booking." };
  }

  revalidatePath("/dashboard/admin/approvals");
  revalidatePath("/dashboard/consumer");
  revalidatePath("/dashboard/analytics");

  return { success: "Booking rejected and stock released." };
}

export async function returnBooking(bookingId: string): Promise<ActionState> {
  const session = await requireAdmin();

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: { asset: true },
  });

  if (!booking) return { error: "Booking not found." };
  if (booking.status !== "Approved") {
    return { error: "Only approved bookings can be marked as returned." };
  }

  try {
    await db.update(bookings).set({ status: "Returned" }).where(eq(bookings.id, bookingId));

    await db
      .update(assets)
      .set({
        quantityAvailable: sql`${assets.quantityAvailable} + ${booking.quantityRequested}`,
        updatedAt: new Date(),
      })
      .where(eq(assets.id, booking.assetId));

    await db.insert(auditLogs).values({
      action: `Marked "${booking.asset.name}" (${booking.quantityRequested}x) as returned`,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Failed to return booking:", error);
    return { error: "An error occurred while returning the booking." };
  }

  revalidatePath("/dashboard/admin/approvals");
  revalidatePath("/dashboard/consumer");
  revalidatePath("/dashboard/analytics");

  return { success: "Asset marked as returned and restocked." };
}
