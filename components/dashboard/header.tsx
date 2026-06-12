import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import type { UserRole } from "@/types/next-auth";

export function Header({
  user,
}: {
  user: { name: string; email: string; role: UserRole };
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <MobileSidebar role={user.role} />
        <div>
          <p className="text-sm font-semibold leading-tight">Smart Asset Platform</p>
          <p className="text-xs text-muted-foreground">
            {user.role === "Admin" ? "Administrator workspace" : "Consumer workspace"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <UserNav name={user.name} email={user.email} role={user.role} />
      </div>
    </header>
  );
}
