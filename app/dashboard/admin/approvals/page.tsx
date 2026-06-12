import { getBookingQueue } from "@/app/actions/approvals";
import { ApprovalQueue } from "@/components/admin/approval-queue";


export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const bookings = await getBookingQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approval Queue</h1>
        <p className="text-muted-foreground">
          Review booking requests, manage active checkouts, and process returns.
        </p>
      </div>
      <ApprovalQueue bookings={bookings} />
    </div>
  );
}
