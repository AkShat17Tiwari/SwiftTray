"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, MessageSquare, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const TICKETS = [
  { id: "TK-001", user: "Arjun Patel", subject: "Order charged but not received", outlet: "Dragon Bowl", status: "open", priority: "high", time: "2h ago", orderId: "ST-B4K9" },
  { id: "TK-002", user: "Sneha Reddy", subject: "Wrong item delivered", outlet: "Spice Junction", status: "in_progress", priority: "medium", time: "5h ago", orderId: "ST-C7L2" },
  { id: "TK-003", user: "Vikram Singh", subject: "App crashing on checkout", outlet: null, status: "open", priority: "urgent", time: "1h ago", orderId: null },
  { id: "TK-004", user: "Ananya Sharma", subject: "Refund not processed", outlet: "South Express", status: "resolved", priority: "medium", time: "1d ago", orderId: "ST-A3M5" },
  { id: "TK-005", user: "Rohan Kumar", subject: "Allergic ingredients not listed", outlet: "Fresh Bowl", status: "open", priority: "high", time: "3h ago", orderId: "ST-D9N1" },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle2,
  closed: CheckCircle2,
};

export default function AdminTicketsPage() {
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const filtered = filter === "all" ? TICKETS : TICKETS.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">Support <span className="gradient-text">Tickets</span></h1>
        <p className="text-sm text-muted-foreground">Resolve student and vendor issues</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open", count: TICKETS.filter(t => t.status === "open").length, color: "text-red-500" },
          { label: "In Progress", count: TICKETS.filter(t => t.status === "in_progress").length, color: "text-amber-500" },
          { label: "Resolved", count: TICKETS.filter(t => t.status === "resolved").length, color: "text-emerald-500" },
          { label: "Total", count: TICKETS.length, color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className={`text-lg font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "open", "in_progress", "resolved"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/50 text-muted-foreground border border-transparent"
            }`}
          >
            {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div className="space-y-3">
        {filtered.map((ticket, i) => {
          const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;
          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card p-4 border-l-2 ${
                ticket.priority === "urgent" ? "border-l-red-500" :
                ticket.priority === "high" ? "border-l-amber-500" : "border-l-blue-500"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-muted-foreground">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${PRIORITY_COLORS[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <StatusIcon className="w-3 h-3" />
                      {ticket.status === "in_progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{ticket.subject}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>👤 {ticket.user}</span>
                    {ticket.outlet && <span>🏪 {ticket.outlet}</span>}
                    {ticket.orderId && <span>🎫 {ticket.orderId}</span>}
                    <span>⏰ {ticket.time}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {ticket.status === "open" && (
                    <button className="px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-medium">
                      Assign
                    </button>
                  )}
                  {ticket.status === "in_progress" && (
                    <button className="px-3 py-1.5 rounded-lg gradient-success text-white text-xs font-medium">
                      Resolve
                    </button>
                  )}
                  <button className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Reply
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
