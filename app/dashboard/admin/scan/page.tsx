import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { assets, type Asset } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { QrScanner } from "@/components/admin/qr-scanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ReturnBookingForm } from "@/components/admin/return-booking-form";


export const dynamic = "force-dynamic";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const assetId = typeof resolvedParams.assetId === "string" ? resolvedParams.assetId : null;

  let asset: Asset | undefined;
  let activeBooking = null;

  if (assetId) {
    asset = await db.query.assets.findFirst({
      where: eq(assets.id, assetId),
    });

    if (asset) {
      // Find if there's an active (Approved) booking for this asset
      // In a real system, there could be multiple. We just take the most recent Approved one.
      const currentAssetId = asset.id;
      activeBooking = await db.query.bookings.findFirst({
        where: (b, { and, eq }) => and(eq(b.assetId, currentAssetId), eq(b.status, "Approved")),
        orderBy: (b, { desc }) => [desc(b.createdAt)],
        with: { user: true },
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
        <p className="text-muted-foreground">
          Scan an asset tag to instantly process returns or view status.
        </p>
      </div>

      {!assetId ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Camera Scanner</CardTitle>
            <CardDescription>Point your device camera at an asset QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <QrScanner />
          </CardContent>
        </Card>
      ) : !asset ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Asset Not Found</CardTitle>
            <CardDescription>The scanned QR code does not match any known asset in the database.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{asset.name}</CardTitle>
              <CardDescription>{asset.category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Status</span>
                <StatusBadge status={asset.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Stock</span>
                <Badge variant="secondary">
                  {asset.quantityAvailable} / {asset.quantityTotal}
                </Badge>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground font-medium">ID</span>
                <span className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                  {asset.id}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Process operations for this asset</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBooking ? (
                <div className="space-y-4 border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Active Checkout</p>
                    <p className="font-semibold mt-1">{activeBooking.user?.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {activeBooking.quantityRequested}</p>
                  </div>
                  <ReturnBookingForm bookingId={activeBooking.id} />
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No active checkouts found for this asset.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
