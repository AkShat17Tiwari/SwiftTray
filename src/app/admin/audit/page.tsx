"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Shield } from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatRelativeTime } from "@/lib/utils";

export default function AdminAuditPage() {
  const logs = useQuery(api.auditLogs.list, { limit: 100 });
  const [filter, setFilter] = useState("all");
  const types = ["all", ...new Set((logs ?? []).map((log) => log.targetType))];
  const visible = filter === "all" ? logs ?? [] : (logs ?? []).filter((log) => log.targetType === filter);
  return <div className="space-y-6"><header><h1 className="text-2xl font-extrabold">Audit <span className="gradient-text">Log</span></h1><p className="text-sm text-muted-foreground">Recorded application activity</p></header><div className="flex gap-2 overflow-x-auto">{types.map((type) => <button type="button" key={type} onClick={() => setFilter(type)} aria-pressed={filter === type} className={`min-h-10 px-3 rounded-full text-xs capitalize ${filter === type ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground"}`}>{type}</button>)}</div><div className="space-y-2">{logs === undefined ? <p className="py-12 text-center text-sm text-muted-foreground">Loading audit records…</p> : visible.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No audit events have been recorded.</p> : visible.map((log) => <div key={log._id} className="glass-card p-4 flex gap-3"><div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><Shield className="w-4 h-4"/></div><div className="flex-1 min-w-0"><p className="text-sm"><span className="font-bold">{log.userName}</span> · {log.action.replaceAll("_", " ")}</p><p className="text-xs text-muted-foreground truncate">{log.details || `${log.targetType}${log.targetId ? ` · ${log.targetId}` : ""}`}</p></div><time className="text-xs text-muted-foreground">{formatRelativeTime(log._creationTime)}</time></div>)}</div></div>;
}
