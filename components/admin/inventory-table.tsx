"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { AssetFormDialog } from "@/components/admin/asset-form-dialog";
import { DeleteAssetDialog } from "@/components/admin/delete-asset-dialog";
import { QrCodeDialog } from "@/components/admin/qr-code-dialog";
import { AssetHealthDialog } from "@/components/admin/asset-health-dialog";
import type { Asset } from "@/lib/db/schema";

export function InventoryTable({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No assets yet — add your first asset to get started.
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="grid gap-3 sm:hidden">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">{asset.category}</p>
                </div>
                <StatusBadge status={asset.status} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">
                  {asset.quantityAvailable} / {asset.quantityTotal}
                </Badge>
                <div className="flex gap-1">
                  <QrCodeDialog asset={asset} />
                  <AssetHealthDialog asset={asset} />
                  <AssetFormDialog asset={asset} />
                  <DeleteAssetDialog asset={asset} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell className="text-muted-foreground">{asset.category}</TableCell>
                <TableCell>
                  <StatusBadge status={asset.status} />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {asset.quantityAvailable} / {asset.quantityTotal}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <QrCodeDialog asset={asset} />
                    <AssetHealthDialog asset={asset} />
                    <AssetFormDialog asset={asset} />
                    <DeleteAssetDialog asset={asset} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
