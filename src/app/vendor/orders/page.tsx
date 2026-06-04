"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, X as XIcon, ChefHat,
  Package, Filter,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatPrice, formatRelativeTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import type { Order } from "@/types";
import type { Id } from "@convex/_generated/dataModel";

type StatusFilter = "all" | "placed" | "accepted" | "preparing" | "ready" | "picked_up" | "cancelled";
type VendorOrder = Order & { _id: Id<"orders"> };

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "placed", label: "New" },
  { value: "accepted", label: "Accepted" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "picked_up", label: "Picked Up" },
  { value: "cancelled", label: "Cancelled" },
];

export default function VendorOrdersPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const { user } = useUser();
  const workspace = useQuery(
    api.dashboards.vendorWorkspace,
    user?.id ? { vendorUserId: user.id } : "skip"
  ) as { recentOrders: VendorOrder[] } | null | undefined;
  const updateStatus = useMutation(api.orders.updateStatus);
  const orders = workspace?.recentOrders ?? [];
  const isLoading = workspace === undefined;

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  const handleStatus = async (
    orderId: Id<"orders">,
    status: "accepted" | "preparing" | "ready" | "picked_up" | "cancelled"
  ) => {
    try {
      await updateStatus({ orderId, status });
      toast.success("Order updated");
    } catch {
      toast.error("Could not update order");
    }
  };

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

      {/* Filters — Neumorphic Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {FILTERS.map((f) => {
          const count = f.value === "all"
            ? orders.length
            : orders.filter((o) => o.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? "neu-pill-active text-primary"
                  : "neu-pill text-muted-foreground"
              }`}
            >
              {f.label}
              <span className="bg-[#E4EBF5] px-1.5 py-0.5 rounded-full text-[10px] shadow-neu-inset-sm">
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Clock className="w-8 h-8 animate-pulse mb-3" />
              <p className="text-sm">Loading live orders...</p>
            </div>
          ) : workspace === null ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl neu-pressed flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-1">No outlet assigned</h3>
              <p className="text-sm text-muted-foreground">Verify a vendor key to see your outlet orders</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl neu-pressed flex items-center justify-center mb-4">
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
                className="neu-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">#{order.pickupToken}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      {order.status === "placed" && (
                        <span className="flex items-center gap-1 text-[10px] text-[#F5A623] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
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
                      <p className="text-xs text-[#F5A623] mt-1.5 bg-[#F5A623]/10 px-2 py-1 rounded-lg">
                        📝 {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {order.status === "placed" && (
                      <>
                        <button
                          onClick={() => handleStatus(order._id, "accepted")}
                          className="px-3 py-1.5 rounded-lg gradient-success text-white text-xs font-medium flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => handleStatus(order._id, "cancelled")}
                          className="px-3 py-1.5 rounded-lg bg-[#E85D75]/10 text-[#E85D75] text-xs font-medium flex items-center gap-1 hover:bg-[#E85D75]/20 transition-colors"
                        >
                          <XIcon className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <button
                        onClick={() => handleStatus(order._id, "preparing")}
                        className="px-3 py-1.5 rounded-lg gradient-warning text-[#1A2E35] text-xs font-medium flex items-center gap-1"
                      >
                        <ChefHat className="w-3 h-3" /> Start Prep
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button
                        onClick={() => handleStatus(order._id, "ready")}
                        className="px-3 py-1.5 rounded-lg gradient-mint text-[#1A2E35] text-xs font-medium flex items-center gap-1"
                      >
                        <Package className="w-3 h-3" /> Mark Ready
                      </button>
                    )}
                    {order.status === "ready" && (
                      <button
                        onClick={() => handleStatus(order._id, "picked_up")}
                        className="px-3 py-1.5 rounded-lg gradient-success text-white text-xs font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Picked Up
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
