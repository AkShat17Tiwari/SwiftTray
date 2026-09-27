"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const students = useQuery(api.users.listByRole, { role: "student" });
  const orders = useQuery(api.orders.list, {});
  const updateStatus = useMutation(api.users.updateStatus);
  const rows = useMemo(() => (students ?? []).map((student) => {
    const owned = (orders ?? []).filter((order) => order.userId === student.authUserId);
    const paid = owned.filter((order) => order.paymentStatus === "completed");
    return { ...student, orderCount: owned.length, spent: paid.reduce((sum, order) => sum + order.totalAmount, 0), lastOrder: owned.sort((a, b) => b._creationTime - a._creationTime)[0]?._creationTime };
  }), [students, orders]);
  const visible = rows.filter((row) => `${row.name} ${row.email}`.toLowerCase().includes(search.trim().toLowerCase()));
  const setStatus = async (userId: Id<"users">, status: "active" | "suspended") => { try { await updateStatus({ userId, status }); toast.success(status === "active" ? "Student restored" : "Student suspended"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update student"); } };

  return <div className="space-y-6"><header><h1 className="text-2xl font-extrabold">Student <span className="gradient-text">Activity</span></h1><p className="text-sm text-muted-foreground">Live account and paid-order totals</p></header>
    <label className="relative block"><span className="sr-only">Search students</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" className="w-full min-h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border"/></label>
    <div className="glass-card overflow-x-auto"><div className="min-w-[720px]"><div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b"><span className="col-span-4">Student</span><span className="col-span-2 text-center">Orders</span><span className="col-span-2 text-center">Paid total</span><span className="col-span-2">Last order</span><span className="col-span-2 text-right">Account</span></div>
    {students === undefined || orders === undefined ? <p className="p-10 text-center text-sm text-muted-foreground">Loading students…</p> : visible.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">No matching students.</p> : visible.map((student) => <div key={student._id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center border-b last:border-0"><div className="col-span-4"><p className="font-semibold text-sm">{student.name}</p><p className="text-xs text-muted-foreground">{student.email}</p></div><span className="col-span-2 text-center text-sm font-bold">{student.orderCount}</span><span className="col-span-2 text-center text-sm font-bold text-emerald-600">{formatPrice(student.spent)}</span><span className="col-span-2 text-xs text-muted-foreground">{student.lastOrder ? formatRelativeTime(student.lastOrder) : "No orders"}</span><div className="col-span-2 flex justify-end"><button type="button" onClick={() => setStatus(student._id, student.status === "suspended" ? "active" : "suspended")} className={`min-h-10 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${student.status === "suspended" ? "text-emerald-600 bg-emerald-500/10" : "text-red-600 bg-red-500/10"}`}>{student.status === "suspended" ? <ShieldCheck className="w-4 h-4"/> : <ShieldBan className="w-4 h-4"/>}{student.status === "suspended" ? "Restore" : "Suspend"}</button></div></div>)}
    </div></div>
  </div>;
}
