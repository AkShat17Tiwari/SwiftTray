"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardList, ChevronRight, Package, RefreshCw, Clock,
} from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";

export default function OrdersPage() {
  const [tab, setTab] = useState<"active" | "past">("active");

  const activeOrders = MOCK_ORDERS.filter(
    (o) => !["picked_up", "cancelled"].includes(o.status)
  );
  const pastOrders = MOCK_ORDERS.filter(
    (o) => ["picked_up", "cancelled"].includes(o.status)
  );
  const orders = tab === "active" ? activeOrders : pastOrders;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-extrabold mb-1">
              My <span className="gradient-text">Orders</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Track active orders and view past history
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6">
            {(["active", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "active" ? "Active" : "Past"}{" "}
                <span className="text-xs ml-1 opacity-60">
                  ({t === "active" ? activeOrders.length : pastOrders.length})
                </span>
              </button>
            ))}
          </div>

          {/* Orders */}
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/orders/${order._id}`}>
                  <div className="glass-card p-4 group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={order.outletImage}
                          alt={order.outletName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold">
                              {order.outletName}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {order.items.map((i) => i.name).join(", ")}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex-shrink-0 ${getOrderStatusColor(
                              order.status
                            )}`}
                          >
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{formatDate(order._creationTime)}</span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {order.status === "picked_up" && (
                              <button
                                onClick={(e) => e.preventDefault()}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3" /> Reorder
                              </button>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pickup Token for ready orders */}
                    {order.status === "ready" && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Pickup Token:
                        </span>
                        <span className="text-lg font-extrabold gradient-text tracking-wider">
                          {order.pickupToken}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  No {tab} orders
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {tab === "active"
                    ? "You don't have any active orders right now"
                    : "Your order history will appear here"}
                </p>
                <Link href="/outlets">
                  <button className="px-6 py-2.5 rounded-full gradient-primary text-white text-sm font-medium shadow-colored">
                    Start Ordering
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
