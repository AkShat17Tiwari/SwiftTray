"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";

type TicketStatus = Doc<"supportTickets">["status"];
const filters: (TicketStatus | "all")[] = ["all", "open", "in_progress", "resolved", "closed"];

export default function AdminTicketsPage() {
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const tickets = useQuery(api.supportTickets.listAll, filter === "all" ? {} : { status: filter });
  const update = useMutation(api.supportTickets.updateStatus);
  const change = async (id: Id<"supportTickets">, status: TicketStatus) => {
    const resolution = ["resolved", "closed"].includes(status) ? window.prompt("Resolution note")?.trim() : undefined;
    if (["resolved", "closed"].includes(status) && !resolution) return;
    try { await update({ id, status, resolution }); toast.success("Ticket updated"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update ticket"); }
  };
  return <div className="space-y-6"><header><h1 className="text-2xl font-extrabold">Support <span className="gradient-text">Tickets</span></h1><p className="text-sm text-muted-foreground">Live student and vendor requests</p></header><div className="flex gap-2 overflow-x-auto">{filters.map((value) => <button type="button" key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 px-3 rounded-full text-xs capitalize whitespace-nowrap ${filter === value ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground"}`}>{value.replace("_", " ")}</button>)}</div><div className="space-y-3">{tickets === undefined ? <p className="py-12 text-center text-sm text-muted-foreground">Loading tickets…</p> : tickets.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No tickets in this queue.</p> : tickets.map((ticket) => <article key={ticket._id} className="glass-card p-4"><div className="flex flex-col sm:flex-row gap-4 justify-between"><div><div className="flex flex-wrap gap-2 items-center"><span className="font-mono text-xs">#{ticket._id.slice(-6)}</span><span className="px-2 py-1 rounded-full bg-secondary text-[10px] uppercase">{ticket.priority}</span><span className="text-xs text-muted-foreground flex items-center gap-1">{ticket.status === "resolved" ? <CheckCircle2 className="w-3 h-3"/> : ticket.status === "in_progress" ? <Clock className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}{ticket.status.replace("_", " ")}</span></div><h2 className="font-bold mt-2">{ticket.subject}</h2><p className="text-sm text-muted-foreground mt-1">{ticket.description}</p><p className="text-xs text-muted-foreground mt-2">{ticket.userName} · {formatRelativeTime(ticket._creationTime)}</p>{ticket.resolution && <p className="text-sm mt-3 p-3 rounded-xl bg-emerald-500/10"><strong>Resolution:</strong> {ticket.resolution}</p>}</div><div className="flex sm:flex-col gap-2 shrink-0">{ticket.status === "open" && <button type="button" onClick={() => change(ticket._id, "in_progress")} className="min-h-10 px-3 rounded-xl bg-primary/10 text-primary text-xs font-semibold">Start work</button>}{!(["resolved", "closed"] as TicketStatus[]).includes(ticket.status) && <button type="button" onClick={() => change(ticket._id, "resolved")} className="min-h-10 px-3 rounded-xl bg-emerald-500/10 text-emerald-700 text-xs font-semibold">Resolve</button>}{ticket.status === "resolved" && <button type="button" onClick={() => change(ticket._id, "closed")} className="min-h-10 px-3 rounded-xl bg-secondary text-xs font-semibold">Close</button>}</div></div></article>)}</div></div>;
}
