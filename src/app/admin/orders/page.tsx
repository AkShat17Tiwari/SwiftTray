"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { Search } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { Id } from "@convex/_generated/dataModel";
import { formatPrice, formatRelativeTime, getOrderStatusColor, getOrderStatusLabel } from "@/lib/utils";
import { toast } from "sonner";

type Status = Doc<"orders">["status"];
const statuses: (Status | "all")[] = ["all", "placed", "accepted", "preparing", "ready", "picked_up", "cancelled"];

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const orders = useQuery(api.orders.list, filter === "all" ? {} : { status: filter });
  const refundPayment = useAction(api.payments.refundPayment);
  const [refunding, setRefunding] = useState<Id<"orders"> | null>(null);
  const normalized = search.trim().toLowerCase();
  const visible = (orders ?? []).filter((order) =>
    !normalized || order.pickupToken.toLowerCase().includes(normalized) || order.outletName.toLowerCase().includes(normalized)
  );
  const refund = async (orderId: Id<"orders">) => {
    if (!window.confirm("Issue a full Razorpay refund and cancel this order?")) return;
    setRefunding(orderId);
    try {
      const result = await refundPayment({ orderId });
      toast.success(result.state === "refunded" ? "Refund processed" : "Refund submitted to Razorpay");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not refund order");
    } finally {
      setRefunding(null);
    }
  };

  return <div className="space-y-6">
    <header><h1 className="text-2xl font-extrabold">All <span className="gradient-text">Orders</span></h1><p className="text-sm text-muted-foreground">Live platform-wide order monitoring</p></header>
    <div className="flex flex-col sm:flex-row gap-3">
      <label className="relative flex-1"><span className="sr-only">Search orders</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by token or outlet" className="w-full min-h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border/50 text-sm" /></label>
      <div className="flex gap-2 overflow-x-auto" aria-label="Order status filter">{statuses.map((status) => <button type="button" key={status} onClick={() => setFilter(status)} aria-pressed={filter === status} className={`min-h-11 px-3 rounded-full text-xs whitespace-nowrap ${filter === status ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/50 text-muted-foreground"}`}>{status === "all" ? "All" : getOrderStatusLabel(status)}</button>)}</div>
    </div>
    <div className="glass-card overflow-x-auto"><div className="min-w-[760px]">
      <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b"><span className="col-span-2">Token</span><span className="col-span-3">Items</span><span className="col-span-2">Outlet</span><span className="col-span-2 text-center">Status</span><span className="col-span-1 text-right">Amount</span><span className="col-span-2 text-right">Time</span></div>
      {orders === undefined ? <p className="p-10 text-center text-sm text-muted-foreground">Loading orders…</p> : visible.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">No matching orders.</p> : visible.map((order) => <div key={order._id} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center border-b last:border-0 hover:bg-secondary/30">
        <Link href={`/orders/${order._id}`} className="col-span-2 font-bold text-xs hover:text-primary">#{order.pickupToken}</Link><span className="col-span-3 text-xs text-muted-foreground truncate">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</span><span className="col-span-2 text-xs">{order.outletName}</span><span className="col-span-2 text-center"><span className={`px-2 py-1 rounded-full text-[10px] border ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span></span><span className="col-span-1 text-right text-xs font-bold">{formatPrice(order.totalAmount)}</span><div className="col-span-2 flex justify-end items-center gap-2"><span className="text-xs text-muted-foreground">{formatRelativeTime(order._creationTime)}</span>{order.paymentStatus === "completed" && order.status !== "picked_up" && <button type="button" disabled={refunding === order._id} onClick={() => refund(order._id)} className="min-h-9 px-2 rounded-lg bg-red-500/10 text-red-700 text-[10px] font-bold disabled:opacity-60">{refunding === order._id ? "Refunding…" : "Refund"}</button>}</div>
      </div>)}
    </div></div>
  </div>;
}
