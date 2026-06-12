"use client";

import { motion } from "framer-motion";
import { BarChart3, Boxes, ClipboardCheck, Workflow } from "lucide-react";

const features = [
  {
    icon: Boxes,
    title: "Live Inventory",
    description: "Track every asset, quantity, and category in one real-time source of truth.",
  },
  {
    icon: ClipboardCheck,
    title: "Smart Booking",
    description: "Consumers request resources; stock levels are checked atomically to prevent overbooking.",
  },
  {
    icon: Workflow,
    title: "Approval Workflows",
    description: "Admins approve, reject, or process returns with a fully auditable trail.",
  },
  {
    icon: BarChart3,
    title: "Utilization Analytics",
    description: "Visualize active bookings, overdue returns, and category utilization at a glance.",
  },
];

export function FeatureHighlights() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {features.map((feature, idx) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 + idx * 0.1, ease: "easeOut" }}
          className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
        >
          <feature.icon className="mb-2 h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
