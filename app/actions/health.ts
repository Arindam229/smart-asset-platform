"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assetHealth, auditLogs } from "@/lib/db/schema";
import type { ActionState } from "./approvals";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

export async function getAssetHealth(assetId: string) {
  return db.query.assetHealth.findFirst({
    where: eq(assetHealth.assetId, assetId),
  });
}

export async function updateAssetHealthAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();

  const assetId = String(formData.get("assetId") ?? "");
  const condition = String(formData.get("condition") ?? "Good") as any;
  const maintenanceNotes = String(formData.get("maintenanceNotes") ?? "").trim();
  const assetName = String(formData.get("assetName") ?? "Asset");

  if (!assetId) return { error: "Missing asset ID." };

  const existing = await db.query.assetHealth.findFirst({
    where: eq(assetHealth.assetId, assetId),
  });

  let newHistory = existing?.maintenanceHistory || "";
  if (maintenanceNotes) {
    const timestamp = new Date().toISOString().split("T")[0];
    const logEntry = `[${timestamp}] ${session.user.name}: ${maintenanceNotes}`;
    newHistory = newHistory ? `${newHistory}\n${logEntry}` : logEntry;
  }

  if (existing) {
    await db
      .update(assetHealth)
      .set({
        condition,
        maintenanceHistory: newHistory,
        lastCheckedAt: new Date(),
      })
      .where(eq(assetHealth.id, existing.id));
  } else {
    // Failsafe if it didn't exist
    await db.insert(assetHealth).values({
      assetId,
      condition,
      maintenanceHistory: newHistory,
      lastCheckedAt: new Date(),
    });
  }

  await db.insert(auditLogs).values({
    action: `Updated health condition of "${assetName}" to ${condition}`,
    userId: session.user.id,
  });

  revalidatePath("/dashboard/admin/inventory");
  
  return { success: `Health tracking updated for ${assetName}.` };
}
