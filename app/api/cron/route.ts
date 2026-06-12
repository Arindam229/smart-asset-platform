import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, and, lt } from "drizzle-orm";
import { bookings, notifications } from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email";

export async function GET(request: Request) {
  // Simple auth for Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find all approved bookings where returnDate is in the past
    const overdueBookings = await db.query.bookings.findMany({
      where: and(
        eq(bookings.status, "Approved"),
        lt(bookings.endDate, now)
      ),
      with: { asset: true, user: true },
    });

    if (overdueBookings.length === 0) {
      return NextResponse.json({ message: "No overdue assets found." });
    }

    // Process overdue notifications
    for (const booking of overdueBookings) {
      // Create in-app notification
      await db.insert(notifications).values({
        userId: booking.userId,
        title: "Overdue Asset",
        message: `Your booking for ${booking.quantityRequested}x "${booking.asset.name}" was due on ${booking.endDate.toLocaleDateString()}. Please return it as soon as possible.`,
        type: "Warning",
      });

      // Send email notification
      if (booking.user?.email) {
        await sendNotificationEmail({
          to: booking.user.email,
          subject: "AssetFlow - Overdue Asset Notice",
          html: `
            <p>Hello ${booking.user.name},</p>
            <p>This is a reminder that your booking for <strong>${booking.quantityRequested}x "${booking.asset.name}"</strong> is currently overdue.</p>
            <p>It was due to be returned on <strong>${booking.endDate.toLocaleDateString()}</strong>.</p>
            <p>Please log in to your dashboard and process the return, or contact an administrator.</p>
          `,
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      message: `Processed ${overdueBookings.length} overdue bookings.`,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
