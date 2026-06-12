"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAsset, updateAsset } from "@/app/actions/assets";
import type { Asset } from "@/lib/db/schema";

const STATUSES = ["Available", "Unavailable", "Maintenance"] as const;

export function AssetFormDialog({ asset }: { asset?: Asset }) {
  const isEdit = Boolean(asset);
  const action = isEdit ? updateAsset : createAsset;
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={isEdit ? <Button variant="ghost" size="icon" /> : <Button />}>
        {isEdit ? (
          <>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit asset</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add Asset
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${asset?.name}` : "Add New Asset"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this asset."
              : "Add a new asset to the shared inventory pool."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={asset?.id} />}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={asset?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                defaultValue={asset?.category}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={asset?.status ?? "Available"}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={asset?.description ?? ""}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantityTotal">Total Quantity</Label>
              <Input
                id="quantityTotal"
                name="quantityTotal"
                type="number"
                min={0}
                defaultValue={asset?.quantityTotal ?? 1}
                required
              />
            </div>
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="quantityAvailable">Available Quantity</Label>
                <Input
                  id="quantityAvailable"
                  name="quantityAvailable"
                  type="number"
                  min={0}
                  defaultValue={asset?.quantityAvailable}
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
