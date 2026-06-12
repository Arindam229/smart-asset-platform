"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/components/dashboard/nav-items";
import type { UserRole } from "@/types/next-auth";

export function SidebarContent({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = getNavItems(role);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
          <Boxes className="h-5 w-5 text-primary" />
        </div>
        <span className="text-lg font-semibold tracking-tight">AssetFlow</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Smart Asset Platform</p>
        <p>Resource allocation, simplified.</p>
      </div>
    </div>
  );
}
