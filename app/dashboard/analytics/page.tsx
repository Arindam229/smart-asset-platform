import { AlertTriangle, Boxes, CalendarClock, ClipboardList } from "lucide-react";
import { getAnalytics } from "@/app/actions/analytics";
import { KpiCard } from "@/components/admin/kpi-card";
import { UtilizationArc } from "@/components/admin/utilization-arc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
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

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics &amp; Utilization</h1>
        <p className="text-muted-foreground">
          A real-time snapshot of resource allocation across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          index={0}
          title="Total Assets"
          value={data.totalAssets}
          icon={<Boxes className="h-6 w-6" />}
          description={`${data.totalUnits} units tracked`}
        />
        <KpiCard
          index={1}
          title="Active Bookings"
          value={data.activeBookings}
          icon={<ClipboardList className="h-6 w-6" />}
          description="Currently checked out"
          accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
        <KpiCard
          index={2}
          title="Pending Requests"
          value={data.pendingBookings}
          icon={<CalendarClock className="h-6 w-6" />}
          description="Awaiting approval"
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <KpiCard
          index={3}
          title="Overdue Returns"
          value={data.overdueReturns}
          icon={<AlertTriangle className="h-6 w-6" />}
          description="Past their due date"
          accent="bg-red-500/10 text-red-600 dark:text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overall Utilization</CardTitle>
            <CardDescription>Share of total inventory currently allocated.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <UtilizationArc value={data.utilizationRate} label="In use" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Utilization by Category</CardTitle>
            <CardDescription>How heavily each category&apos;s stock is allocated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.categoryUtilization.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No categories tracked yet.
              </p>
            ) : (
              data.categoryUtilization.map((cat) => (
                <Progress key={cat.category} value={cat.utilization}>
                  <div className="flex w-full items-center justify-between">
                    <ProgressLabel>{cat.category}</ProgressLabel>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {cat.inUse} / {cat.total} in use ({cat.utilization}%)
                    </span>
                  </div>
                </Progress>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overdue Returns</CardTitle>
          <CardDescription>Bookings that are past their scheduled end date.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.overdueBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Nothing is overdue right now.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.overdueBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.assetName}</TableCell>
                      <TableCell className="text-muted-foreground">{booking.userName}</TableCell>
                      <TableCell>{booking.quantityRequested}</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        {formatDate(booking.endDate)}
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
