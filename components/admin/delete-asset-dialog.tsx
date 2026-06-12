"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
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
import { deleteAssetAction } from "@/app/actions/assets";
import type { Asset } from "@/lib/db/schema";

export function DeleteAssetDialog({ asset }: { asset: Asset }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAssetAction, null);

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
      <DialogTrigger
        render={<Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" />}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete asset</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{asset.name}&quot;?</DialogTitle>
          <DialogDescription>
            This permanently removes the asset from inventory. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={asset.id} />
          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
