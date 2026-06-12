import { getAvailableAssets, getMyBookings } from "@/app/actions/bookings";
import { AssetCard } from "@/components/shared/asset-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function ConsumerDashboardPage() {
  const [assets, myBookings] = await Promise.all([getAvailableAssets(), getMyBookings()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Asset Explorer</h1>
        <p className="text-muted-foreground">
          Browse available resources and request a booking for the items you need.
        </p>
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No assets are currently in inventory.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset, index) => (
            <AssetCard key={asset.id} asset={asset} index={index} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Borrowing History</CardTitle>
          <CardDescription>Track the status of your booking requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile view: Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {myBookings.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                You haven&apos;t requested any bookings yet.
              </div>
            ) : (
              myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col space-y-3 rounded-lg border border-border/50 bg-white/[0.02] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-medium">{booking.asset.name}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-muted-foreground/70">
                        Quantity
                      </span>
                      {booking.quantityRequested}
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-muted-foreground/70">
                        Start
                      </span>
                      {formatDate(booking.startDate)}
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-muted-foreground/70">
                        End
                      </span>
                      {formatDate(booking.endDate)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop view: Table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      You haven&apos;t requested any bookings yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  myBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.asset.name}</TableCell>
                      <TableCell>{booking.quantityRequested}</TableCell>
                      <TableCell>{formatDate(booking.startDate)}</TableCell>
                      <TableCell>{formatDate(booking.endDate)}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={booking.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
