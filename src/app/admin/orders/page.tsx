"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Filter, Search } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatPrice, formatRelativeTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";

type StatusFilter = "all" | "placed" | "accepted" | "preparing" | "ready" | "picked_up" | "cancelled";

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const filteredOrders = MOCK_ORDERS
    .filter((o) => filter === "all" || o.status === filter)
    .filter((o) => search === "" || o.pickupToken.toLowerCase().includes(search.toLowerCase()) || o.outletName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">All <span className="gradient-text">Orders</span></h1>
        <p className="text-sm text-muted-foreground">Platform-wide order monitoring and SLA tracking</p>
      </motion.div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by token or outlet..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {(["all", "placed", "accepted", "preparing", "ready", "picked_up", "cancelled"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/50 text-muted-foreground border border-transparent"
              }`}
            >
              {f === "all" ? "All" : getOrderStatusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
          <span className="col-span-2">Token</span>
          <span className="col-span-3">Items</span>
          <span className="col-span-2">Outlet</span>
          <span className="col-span-1 text-center">Status</span>
          <span className="col-span-2 text-center">Amount</span>
          <span className="col-span-2 text-right">Time</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={filter + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {filteredOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
              >
                <span className="col-span-2 font-bold text-xs">#{order.pickupToken}</span>
                <span className="col-span-3 text-xs text-muted-foreground truncate">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </span>
                <span className="col-span-2 text-xs">{order.outletName}</span>
                <div className="col-span-1 flex justify-center">
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
                <span className="col-span-2 text-center text-xs font-bold">{formatPrice(order.totalAmount)}</span>
                <span className="col-span-2 text-right text-xs text-muted-foreground">{formatRelativeTime(order._creationTime)}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
