"use client";

import { useActionState, useEffect } from "react";
import { returnBookingAction } from "@/app/actions/approvals";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ReturnBookingForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, isPending] = useActionState(returnBookingAction, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success(state.success);
    }
  }, [state]);

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="bookingId" value={bookingId} />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Process Return
      </Button>
    </form>
  );
}
