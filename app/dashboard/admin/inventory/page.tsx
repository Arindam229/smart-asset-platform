import { getAssets } from "@/app/actions/assets";
import { AssetFormDialog } from "@/components/admin/asset-form-dialog";
import { InventoryTable } from "@/components/admin/inventory-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const assets = await getAssets();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and remove assets from the shared resource pool.
          </p>
        </div>
        <AssetFormDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
          <CardDescription>
            {assets.length} item{assets.length === 1 ? "" : "s"} tracked across all categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryTable assets={assets} />
        </CardContent>
      </Card>
    </div>
  );
}
