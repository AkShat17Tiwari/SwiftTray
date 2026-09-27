"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { LifeBuoy, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatRelativeTime } from "@/lib/utils";

type Priority = "low" | "medium" | "high" | "urgent";

export default function SupportPage() {
  const tickets = useQuery(api.supportTickets.listMine, {});
  const create = useMutation(api.supportTickets.create);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setPending(true); try { await create({ subject, description, priority }); setSubject(""); setDescription(""); toast.success("Support request submitted"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not submit request"); } finally { setPending(false); } };
  return <><Navbar/><main className="flex-1 pt-24 pb-16 px-4"><div className="max-w-3xl mx-auto space-y-8"><header><div className="neu-icon-mint w-12 h-12 rounded-2xl mb-4"><LifeBuoy className="w-6 h-6"/></div><h1 className="text-3xl font-extrabold">SwiftTray <span className="gradient-text">Support</span></h1><p className="text-sm text-muted-foreground">Describe an ordering, payment, account, or vendor issue.</p></header><form onSubmit={submit} className="neu-card-static p-5 grid gap-4"><label className="text-sm font-semibold">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} required minLength={4} maxLength={120} className="mt-2 w-full min-h-11 px-3 rounded-xl neu-input"/></label><label className="text-sm font-semibold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} maxLength={2000} rows={5} className="mt-2 w-full p-3 rounded-xl neu-input"/></label><label className="text-sm font-semibold">Priority<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="mt-2 w-full min-h-11 px-3 rounded-xl neu-input"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><button disabled={pending} className="min-h-12 rounded-xl neu-btn-primary font-bold flex justify-center items-center gap-2 disabled:opacity-60"><Send className="w-4 h-4"/>{pending ? "Submitting…" : "Submit support request"}</button></form><section><h2 className="text-lg font-bold mb-3">Your requests</h2><div className="space-y-3">{tickets === undefined ? <p className="py-8 text-center text-sm text-muted-foreground">Loading requests…</p> : tickets.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">You have no support requests.</p> : tickets.map((ticket) => <article key={ticket._id} className="neu-card-static p-4"><div className="flex justify-between gap-4"><div><h3 className="font-bold">{ticket.subject}</h3><p className="text-sm text-muted-foreground mt-1">{ticket.description}</p></div><span className="text-xs capitalize">{ticket.status.replace("_", " ")}</span></div><p className="text-xs text-muted-foreground mt-3">{formatRelativeTime(ticket._creationTime)} · {ticket.priority} priority</p>{ticket.resolution && <p className="mt-3 p-3 rounded-xl bg-emerald-500/10 text-sm"><strong>Resolution:</strong> {ticket.resolution}</p>}</article>)}</div></section></div></main><Footer/></>;
}
