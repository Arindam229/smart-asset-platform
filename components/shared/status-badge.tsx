import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Available: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Unavailable: "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  Maintenance: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Rejected: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  Returned: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status] ?? "border-border")}
    >
      {status}
    </Badge>
  );
}
