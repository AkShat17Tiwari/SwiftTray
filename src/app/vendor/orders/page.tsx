"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, X as XIcon, ChefHat,
  Package, Filter,
} from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatPrice, formatRelativeTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";

type StatusFilter = "all" | "placed" | "accepted" | "preparing" | "ready" | "picked_up" | "cancelled";

const FILTERS: { value: StatusFilter; label: string; color: string }[] = [
  { value: "all", label: "All", color: "bg-secondary" },
  { value: "placed", label: "New", color: "bg-blue-500/20 text-blue-400" },
  { value: "accepted", label: "Accepted", color: "bg-indigo-500/20 text-indigo-400" },
  { value: "preparing", label: "Preparing", color: "bg-amber-500/20 text-amber-400" },
  { value: "ready", label: "Ready", color: "bg-emerald-500/20 text-emerald-400" },
  { value: "picked_up", label: "Picked Up", color: "bg-purple-500/20 text-purple-400" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/20 text-red-400" },
];

export default function VendorOrdersPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filteredOrders = filter === "all"
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold mb-1">
          Order <span className="gradient-text">Board</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage incoming and active orders in real-time
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {FILTERS.map((f) => {
          const count = f.value === "all"
            ? MOCK_ORDERS.length
            : MOCK_ORDERS.filter((o) => o.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {f.label}
              <span className="bg-background/50 px-1.5 py-0.5 rounded-full text-[10px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3"
        >
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-1">No orders found</h3>
              <p className="text-sm text-muted-foreground">No orders match the current filter</p>
            </div>
          ) : (
            filteredOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">#{order.pickupToken}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      {order.status === "placed" && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(order._creationTime)}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span>Pickup: {order.pickupSlot}</span>
                    </div>
                    {order.notes && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 bg-amber-500/10 px-2 py-1 rounded-lg">
                        📝 {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {order.status === "placed" && (
                      <>
                        <button className="px-3 py-1.5 rounded-lg gradient-success text-white text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Accept
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium flex items-center gap-1 hover:bg-red-500/20 transition-colors">
                          <XIcon className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <button className="px-3 py-1.5 rounded-lg gradient-warm text-white text-xs font-medium flex items-center gap-1">
                        <ChefHat className="w-3 h-3" /> Start Prep
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button className="px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-medium flex items-center gap-1">
                        <Package className="w-3 h-3" /> Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
