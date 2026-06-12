"use client";

import { useActionState, useEffect, useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateAssetHealthAction, getAssetHealth } from "@/app/actions/health";
import type { Asset, AssetHealth } from "@/lib/db/schema";

export function AssetHealthDialog({ asset }: { asset: Asset }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateAssetHealthAction, null);
  const [healthData, setHealthData] = useState<AssetHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingHealth(true);
      getAssetHealth(asset.id).then((data) => {
        setHealthData(data as AssetHealth);
        setLoadingHealth(false);
      });
    }
  }, [open, asset.id]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success(state.success);
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" title="Health & Maintenance" />}>
        <Activity className="h-4 w-4" />
        <span className="sr-only">Health & Maintenance</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asset Health: {asset.name}</DialogTitle>
          <DialogDescription>
            Update condition and log maintenance for this asset.
          </DialogDescription>
        </DialogHeader>
        
        {loadingHealth ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="assetId" value={asset.id} />
            <input type="hidden" name="assetName" value={asset.name} />
            
            <div className="space-y-2">
              <Label htmlFor="condition">Current Condition</Label>
              <Select name="condition" defaultValue={healthData?.condition || "Good"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceNotes">Add Maintenance Log (Optional)</Label>
              <Textarea
                id="maintenanceNotes"
                name="maintenanceNotes"
                placeholder="E.g., Replaced battery, cleaned screen..."
                className="resize-none"
              />
            </div>

            {healthData?.lastCheckedAt && (
              <div className="text-xs text-muted-foreground">
                Last checked: {new Date(healthData.lastCheckedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </div>
            )}

            {healthData?.maintenanceHistory && (
              <div className="mt-4 p-3 bg-muted rounded-md max-h-32 overflow-y-auto text-xs whitespace-pre-wrap">
                <strong>History:</strong>{"\n"}
                {healthData.maintenanceHistory}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Health Data
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
