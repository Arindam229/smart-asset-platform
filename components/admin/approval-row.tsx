"use client";

import { useActionState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  approveBookingAction,
  rejectBookingAction,
  returnBookingAction,
  getBookingQueue,
  type ActionState,
} from "@/app/actions/approvals";

type BookingWithRelations = Awaited<ReturnType<typeof getBookingQueue>>[number];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function useBookingAction(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
) {
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) toast.success(state.success);
    else if (state.error) toast.error(state.error);
  }, [state]);

  return { formAction, pending };
}

export function ApprovalRow({
  booking,
  index,
}: {
  booking: BookingWithRelations;
  index: number;
}) {
  const approve = useBookingAction(approveBookingAction);
  const reject = useBookingAction(rejectBookingAction);
  const ret = useBookingAction(returnBookingAction);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04 }}
      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{booking.asset.name}</p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {booking.user.name ?? booking.user.email} &middot; {booking.quantityRequested} unit(s)
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
        </p>
      </div>
      <div className="flex gap-2">
        {booking.status === "Pending" && (
          <>
            <form action={approve.formAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <Button type="submit" size="sm" disabled={approve.pending}>
                {approve.pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve
              </Button>
            </form>
            <form action={reject.formAction}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <Button type="submit" size="sm" variant="outline" disabled={reject.pending}>
                {reject.pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Reject
              </Button>
            </form>
          </>
        )}
        {booking.status === "Approved" && (
          <form action={ret.formAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <Button type="submit" size="sm" variant="outline" disabled={ret.pending}>
              {ret.pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Mark Returned
            </Button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
