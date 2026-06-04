"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export function StatCard({ label, value, change, trend = "up", icon: Icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05, duration: 0.5 }}
      whileHover={{ y: -3 }}
      className="neu-card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`neu-icon w-10 h-10 rounded-xl`}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
            trend === "up" ? "text-[#68D89B] bg-[#68D89B]/10" : "text-[#E85D75] bg-[#E85D75]/10"
          }`}>
            {trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}
