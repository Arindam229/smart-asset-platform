import type { LucideIcon } from "lucide-react";
import { BarChart3, ClipboardCheck, LayoutGrid, Package } from "lucide-react";
import type { UserRole } from "@/types/next-auth";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const consumerNavItems: NavItem[] = [
  { title: "Asset Explorer", href: "/dashboard/consumer", icon: LayoutGrid },
];

export const adminNavItems: NavItem[] = [
  { title: "Inventory", href: "/dashboard/admin/inventory", icon: Package },
  { title: "Approvals", href: "/dashboard/admin/approvals", icon: ClipboardCheck },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function getNavItems(role: UserRole): NavItem[] {
  return role === "Admin" ? adminNavItems : consumerNavItems;
}
