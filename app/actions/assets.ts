"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assetHealth, assets, auditLogs } from "@/lib/db/schema";

export type ActionState = { error?: string; success?: string } | null;

const ASSET_STATUSES = ["Available", "Unavailable", "Maintenance"] as const;
type AssetStatus = (typeof ASSET_STATUSES)[number];

function parseStatus(value: FormDataEntryValue | null): AssetStatus {
  const raw = String(value ?? "Available");
  return (ASSET_STATUSES as readonly string[]).includes(raw)
    ? (raw as AssetStatus)
    : "Available";
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

export async function getAssets() {
  return db.query.assets.findMany({
    orderBy: (a, { asc }) => [asc(a.category), asc(a.name)],
  });
}

export async function createAsset(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantityTotal = Number(formData.get("quantityTotal"));
  const status = parseStatus(formData.get("status"));

  if (!name || !category) {
    return { error: "Name and category are required." };
  }
  if (!Number.isFinite(quantityTotal) || quantityTotal < 0) {
    return { error: "Quantity must be a non-negative number." };
  }

  const [asset] = await db
    .insert(assets)
    .values({
      name,
      category,
      description: description || null,
      quantityTotal,
      quantityAvailable: quantityTotal,
      status,
    })
    .returning();

  await db.insert(assetHealth).values({ assetId: asset.id, condition: "Good" });

  await db.insert(auditLogs).values({
    action: `Created asset "${name}" (qty ${quantityTotal})`,
    userId: session.user.id,
  });

  revalidatePath("/dashboard/admin/inventory");
  revalidatePath("/dashboard/consumer");
  revalidatePath("/dashboard/analytics");

  return { success: `"${name}" added to inventory.` };
}

export async function updateAsset(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantityTotal = Number(formData.get("quantityTotal"));
  const quantityAvailable = Number(formData.get("quantityAvailable"));
  const status = parseStatus(formData.get("status"));

  if (!id || !name || !category) {
    return { error: "Name and category are required." };
  }
  if (!Number.isFinite(quantityTotal) || quantityTotal < 0) {
    return { error: "Total quantity must be a non-negative number." };
  }
  if (
    !Number.isFinite(quantityAvailable) ||
    quantityAvailable < 0 ||
    quantityAvailable > quantityTotal
  ) {
    return {
      error: "Available quantity must be between 0 and the total quantity.",
    };
  }

  await db
    .update(assets)
    .set({
      name,
      category,
      description: description || null,
      quantityTotal,
      quantityAvailable,
      status,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id));

  await db.insert(auditLogs).values({
    action: `Updated asset "${name}"`,
    userId: session.user.id,
  });

  revalidatePath("/dashboard/admin/inventory");
  revalidatePath("/dashboard/consumer");
  revalidatePath("/dashboard/analytics");

  return { success: `"${name}" updated.` };
}

export async function deleteAssetAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing asset id." };
  return deleteAsset(id);
}

export async function deleteAsset(id: string): Promise<ActionState> {
  const session = await requireAdmin();

  const asset = await db.query.assets.findFirst({ where: eq(assets.id, id) });

  await db.delete(assets).where(eq(assets.id, id));

  await db.insert(auditLogs).values({
    action: `Deleted asset "${asset?.name ?? id}"`,
    userId: session.user.id,
  });

  revalidatePath("/dashboard/admin/inventory");
  revalidatePath("/dashboard/consumer");
  revalidatePath("/dashboard/analytics");

  return { success: `"${asset?.name ?? "Asset"}" removed from inventory.` };
}
