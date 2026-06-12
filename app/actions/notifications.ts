"use server";

import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export async function getMyNotifications() {
  const session = await auth();
  if (!session?.user) return [];

  return db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    orderBy: [desc(notifications.createdAt)],
    limit: 10,
  });
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user) return;

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id)
      )
    );

  revalidatePath("/dashboard");
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user) return;

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, session.user.id));

  revalidatePath("/dashboard");
}
