"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  title,
  value,
  icon,
  description,
  accent,
  index,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  accent?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              accent ?? "bg-primary/10 text-primary"
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
