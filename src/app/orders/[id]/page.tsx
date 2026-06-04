"use client";

import { useState, useEffect, use } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Clock, MapPin, CheckCircle, Circle, Package,
  RefreshCw, Phone, Copy, ChevronRight,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatPrice, formatDate, formatTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { toast } from "sonner";
import type { Order } from "@/types";
import type { Id } from "@convex/_generated/dataModel";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const canLoadOrder = !id.startsWith("order_");
  const liveOrderId = canLoadOrder ? (id as Id<"orders">) : null;
  const order = useQuery(api.orders.getById, liveOrderId ? { id: liveOrderId } : "skip") as
    | Order
    | null
    | undefined;
  const cancelOrder = useMutation(api.orders.cancel);
  const [eta, setEta] = useState<number>(0);

  useEffect(() => {
    if (order?.estimatedReadyTime) {
      const updateEta = () => {
        const diff = Math.max(0, order.estimatedReadyTime! - Date.now());
        setEta(diff);
      };
      updateEta();
      const timer = setInterval(updateEta, 1000);
      return () => clearInterval(timer);
    }
  }, [order?.estimatedReadyTime]);

  if (!canLoadOrder || order === null) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Order not found</h1>
            <Link href="/orders" className="text-primary">
              Back to orders
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (order === undefined) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-3 animate-pulse" />
            <p className="text-sm">Loading live order...</p>
          </div>
        </main>
      </>
    );
  }

  const etaMinutes = Math.floor(eta / 60000);
  const etaSeconds = Math.floor((eta % 60000) / 1000);

  const currentStepIndex = ORDER_STATUSES.findIndex(
    (s) => s.key === order.status
  );

  const copyToken = () => {
    navigator.clipboard.writeText(order.pickupToken);
    toast.success("Token copied!");
  };

  const handleCancel = async () => {
    try {
      await cancelOrder({ orderId: order._id as Id<"orders"> });
      toast.success("Order cancelled");
    } catch {
      toast.error("Could not cancel this order");
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Back */}
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to orders
          </Link>

          {/* Status Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neu-card-static p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl ${
                order.status === "ready"
                  ? "gradient-success shadow-colored"
                  : "gradient-mint shadow-neu-sm"
              }`}
            >
              {ORDER_STATUSES[currentStepIndex]?.icon}
            </motion.div>

            <h1 className="text-xl font-extrabold mb-1">
              {getOrderStatusLabel(order.status)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {ORDER_STATUSES[currentStepIndex]?.description}
            </p>

            {/* ETA */}
            {eta > 0 && order.status !== "ready" && order.status !== "picked_up" && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full neu-pressed-sm text-primary">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold tabular-nums">
                  {etaMinutes}:{etaSeconds.toString().padStart(2, "0")}
                </span>
                <span className="text-xs">remaining</span>
              </div>
            )}
          </motion.div>

          {/* Pickup Token */}
          {(order.status === "ready" || order.status === "preparing") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`neu-card-static p-6 text-center ${
                order.status === "ready" ? "border-2 border-primary" : ""
              }`}
            >
              <p className="text-xs text-muted-foreground mb-1">
                Pickup Token
              </p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-4xl md:text-5xl font-extrabold gradient-text tracking-[0.2em]">
                  {order.pickupToken}
                </p>
                <button
                  onClick={copyToken}
                  className="w-8 h-8 rounded-lg neu-btn flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Show this at the counter for pickup
              </p>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neu-card-static p-6"
          >
            <h2 className="text-sm font-bold mb-5">Order Timeline</h2>
            <div className="space-y-0">
              {ORDER_STATUSES.map((status, i) => {
                const historyEntry = order.statusHistory.find(
                  (h) => h.status === status.key
                );
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;

                return (
                  <div key={status.key} className="flex gap-4">
                    {/* Line & Circle */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? "gradient-mint text-[#1A2E35] shadow-neu-sm"
                            : "neu-pressed-sm text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </motion.div>
                      {i < ORDER_STATUSES.length - 1 && (
                        <div
                          className={`w-0.5 h-12 ${
                            i < currentStepIndex
                              ? "bg-primary"
                              : "bg-[#C8D0E0]"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-8 pt-0.5">
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {status.label}
                        {isCurrent && (
                          <span className="ml-2 inline-flex w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {historyEntry
                          ? formatTime(historyEntry.timestamp)
                          : status.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neu-card-static p-5"
          >
            <h2 className="text-sm font-bold mb-4">Order Details</h2>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#C8D0E0]">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-neu-sm">
                <Image
                  src={order.outletImage}
                  alt={order.outletName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">{order.outletName}</p>
                <p className="text-xs text-muted-foreground">
                  Pickup at {order.pickupSlot}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{item.quantity}x</span>{" "}
                      {item.name}
                    </p>
                    {item.customizations.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {item.customizations.map((c) => c.selected).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-[#C8D0E0] space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-[#68D89B]">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-[#C8D0E0]">
                <span>Total</span>
                <span className="gradient-text">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 pb-4">
            {order.status === "picked_up" && (
              <Link href="/outlets" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl neu-btn-primary text-[#1A2E35] font-semibold flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reorder
                </motion.button>
              </Link>
            )}
            {(order.status === "placed" || order.status === "accepted") && (
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl neu-btn text-destructive font-medium"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
