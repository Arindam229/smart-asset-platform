"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, PackagePlus } from "lucide-react";
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
import { requestBooking } from "@/app/actions/bookings";
import type { Asset } from "@/lib/db/schema";

export function BookingDialog({ asset }: { asset: Asset }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(requestBooking, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.success);
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const today = new Date().toISOString().split("T")[0];
  const isDisabled = asset.status !== "Available" || asset.quantityAvailable < 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="w-full" disabled={isDisabled} />}>
        <PackagePlus className="h-4 w-4" />
        {isDisabled ? "Unavailable" : "Request Booking"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request: {asset.name}</DialogTitle>
          <DialogDescription>
            {asset.quantityAvailable} of {asset.quantityTotal} unit(s) currently available in{" "}
            {asset.category}.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="assetId" value={asset.id} />
          <div className="space-y-2">
            <Label htmlFor={`qty-${asset.id}`}>Quantity</Label>
            <Input
              id={`qty-${asset.id}`}
              name="quantityRequested"
              type="number"
              min={1}
              max={asset.quantityAvailable}
              defaultValue={1}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`start-${asset.id}`}>Start date</Label>
              <Input id={`start-${asset.id}`} name="startDate" type="date" min={today} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`end-${asset.id}`}>End date</Label>
              <Input id={`end-${asset.id}`} name="endDate" type="date" min={today} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
