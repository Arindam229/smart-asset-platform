import { SidebarContent } from "@/components/dashboard/sidebar-content";
import type { UserRole } from "@/types/next-auth";

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col lg:border-r lg:bg-card">
      <SidebarContent role={role} />
    </aside>
  );
}
