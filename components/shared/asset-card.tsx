"use client";

import { motion } from "framer-motion";
import { Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { BookingDialog } from "@/components/shared/booking-dialog";
import type { Asset } from "@/lib/db/schema";

export function AssetCard({ asset, index }: { asset: Asset; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative h-full"
    >
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/30 via-primary/5 to-transparent opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
      <Card className="relative flex h-full flex-col transition-shadow group-hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Boxes className="h-5 w-5 text-primary" />
            </div>
            <StatusBadge status={asset.status} />
          </div>
          <CardTitle className="pt-2">{asset.name}</CardTitle>
          <CardDescription>{asset.category}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="line-clamp-2 text-sm text-muted-foreground">{asset.description}</p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Availability</span>
            <Badge variant="secondary">
              {asset.quantityAvailable} / {asset.quantityTotal}
            </Badge>
          </div>
        </CardContent>
        <CardFooter>
          <BookingDialog asset={asset} />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
