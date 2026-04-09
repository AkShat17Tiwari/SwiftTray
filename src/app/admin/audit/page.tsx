"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Filter, Search, User, Store, Settings, ShoppingBag, UserCheck } from "lucide-react";

const AUDIT_LOGS = [
  { id: "1", user: "Admin (Akshat)", action: "approved_vendor", target: "Rahul Sharma → Green Leaf Café", time: "2 hours ago", type: "vendor" },
  { id: "2", user: "Admin (Akshat)", action: "suspended_vendor", target: "Sarah Ahmed (Brew & Bite)", time: "4 hours ago", type: "vendor" },
  { id: "3", user: "Amit Kumar", action: "updated_menu", target: "Added 'Paneer Tikka Wrap' to Spice Junction", time: "6 hours ago", type: "menu" },
  { id: "4", user: "Admin (Akshat)", action: "created_coupon", target: "CAMPUS20 — 20% off", time: "1 day ago", type: "coupon" },
  { id: "5", user: "Li Wei", action: "toggled_availability", target: "Dragon Noodles → Out of Stock", time: "1 day ago", type: "menu" },
  { id: "6", user: "Admin (Akshat)", action: "sent_announcement", target: "Campus Food Festival announcement", time: "2 days ago", type: "announcement" },
  { id: "7", user: "System", action: "auto_cancelled_order", target: "Order ST-X7P2 — No response in 15 min", time: "2 days ago", type: "order" },
  { id: "8", user: "Admin (Akshat)", action: "updated_commission", target: "South Express: 12% → 10%", time: "3 days ago", type: "settings" },
  { id: "9", user: "Meera Devi", action: "updated_hours", target: "South Express: 8AM-9PM → 8AM-10PM", time: "3 days ago", type: "settings" },
  { id: "10", user: "Admin (Akshat)", action: "resolved_ticket", target: "TK-004 — Refund processed", time: "4 days ago", type: "ticket" },
];

const ACTION_ICONS: Record<string, typeof Shield> = {
  vendor: UserCheck,
  menu: Store,
  coupon: ShoppingBag,
  announcement: Shield,
  order: ShoppingBag,
  settings: Settings,
  ticket: User,
};

const ACTION_COLORS: Record<string, string> = {
  vendor: "text-indigo-400",
  menu: "text-amber-400",
  coupon: "text-emerald-400",
  announcement: "text-blue-400",
  order: "text-red-400",
  settings: "text-purple-400",
  ticket: "text-cyan-400",
};

export default function AdminAuditPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const filtered = typeFilter === "all" ? AUDIT_LOGS : AUDIT_LOGS.filter(l => l.type === typeFilter);
  const types = ["all", ...new Set(AUDIT_LOGS.map(l => l.type))];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">Audit <span className="gradient-text">Log</span></h1>
        <p className="text-sm text-muted-foreground">Complete activity trail for compliance and debugging</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
              typeFilter === t ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/50 text-muted-foreground border border-transparent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {filtered.map((log, i) => {
          const Icon = ACTION_ICONS[log.type] || Shield;
          const color = ACTION_COLORS[log.type] || "text-muted-foreground";
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 py-3 px-4 rounded-xl hover:bg-secondary/20 transition-colors"
            >
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-bold">{log.user}</span>
                  <span className="text-muted-foreground"> — </span>
                  <span className="text-muted-foreground">{log.action.replace(/_/g, " ")}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{log.target}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{log.time}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
