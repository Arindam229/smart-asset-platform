"use client";

import { AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApprovalRow } from "@/components/admin/approval-row";
import { getBookingQueue } from "@/app/actions/approvals";

type BookingWithRelations = Awaited<ReturnType<typeof getBookingQueue>>[number];

function Section({
  title,
  description,
  bookings,
}: {
  title: string;
  description: string;
  bookings: BookingWithRelations[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing here right now.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {bookings.map((booking, index) => (
              <ApprovalRow key={booking.id} booking={booking} index={index} />
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}

export function ApprovalQueue({ bookings }: { bookings: BookingWithRelations[] }) {
  const pending = bookings.filter((b) => b.status === "Pending");
  const active = bookings.filter((b) => b.status === "Approved");
  const history = bookings
    .filter((b) => b.status === "Rejected" || b.status === "Returned")
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <Section
        title="Pending Requests"
        description="Review and approve or reject incoming booking requests."
        bookings={pending}
      />
      <Section
        title="Active Bookings"
        description="Currently approved and checked-out assets."
        bookings={active}
      />
      <Section
        title="Recent History"
        description="The latest resolved booking requests."
        bookings={history}
      />
    </div>
  );
}
