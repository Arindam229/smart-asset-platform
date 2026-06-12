import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { desc } from "drizzle-orm";
import { auditLogs } from "@/lib/db/schema";


export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    redirect("/dashboard");
  }

  const logs = await db.query.auditLogs.findMany({
    with: { user: true },
    orderBy: [desc(auditLogs.timestamp)],
    limit: 100, // Show last 100 logs
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          A system-wide chronological record of administrative and consumer actions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Showing the latest 100 system events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No logs available.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{log.user.name}</span>
                            <span className="text-xs text-muted-foreground">{log.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">System / Unknown</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
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
