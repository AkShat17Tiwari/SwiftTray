"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, DollarSign, Timer, Users,
  ChevronRight, CheckCircle, X as XIcon, ChefHat,
  Package, Clock, ArrowUpRight, TrendingUp,
  Bell, Zap,
} from "lucide-react";
import { MOCK_ORDERS, MOCK_MENU_ITEMS } from "@/lib/mock-data";
import { formatPrice, formatRelativeTime, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";

const STATS = [
  { label: "Today's Orders", value: "24", change: "+12%", trend: "up" as const, icon: ShoppingBag, color: "from-indigo-500 to-purple-500" },
  { label: "Revenue Today", value: "₹8,450", change: "+8%", trend: "up" as const, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
  { label: "Avg Prep Time", value: "11 min", change: "-2 min", trend: "up" as const, icon: Timer, color: "from-amber-500 to-orange-500" },
  { label: "Active Customers", value: "156", change: "+23%", trend: "up" as const, icon: Users, color: "from-blue-500 to-cyan-500" },
];

const TOP_ITEMS = [
  { name: "Hyderabadi Biryani", orders: 48, revenue: 10560 },
  { name: "Butter Chicken", orders: 42, revenue: 7560 },
  { name: "Masala Dosa", orders: 38, revenue: 2660 },
  { name: "Hakka Noodles", orders: 35, revenue: 4200 },
  { name: "Cappuccino", orders: 32, revenue: 3840 },
];

export default function VendorOverviewPage() {
  const pendingOrders = MOCK_ORDERS.filter(
    (o) => o.status === "placed" || o.status === "accepted" || o.status === "preparing"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">
                Vendor <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Spice Junction • Managing orders & menu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-medium">Outlet Open</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i} />
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoming Orders - 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Incoming Orders
              {pendingOrders.length > 0 && (
                <span className="w-5 h-5 rounded-full gradient-warm text-white text-[10px] font-bold inline-flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </h2>
            <Link href="/vendor/orders" className="text-sm text-primary font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingOrders.slice(0, 5).map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">
                        #{order.pickupToken}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
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
                    </div>
                    {order.notes && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 bg-amber-500/10 px-2 py-1 rounded-lg">
                        📝 {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
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
            ))}
          </div>
        </div>

        {/* Top Selling - 1/3 */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Top Selling
          </h2>
          <div className="glass-card overflow-hidden">
            {TOP_ITEMS.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
              >
                <span className="text-xs font-bold text-muted-foreground w-4">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                </div>
                <span className="text-sm font-bold text-emerald-500">
                  {formatPrice(item.revenue)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground mb-2">Quick Actions</h3>
            <Link href="/vendor/menu">
              <button className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-card/50 text-sm font-medium hover:bg-card transition-colors text-left flex items-center gap-2">
                <span className="text-base">➕</span> Add Menu Item
              </button>
            </Link>
            <button className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-card/50 text-sm font-medium hover:bg-card transition-colors text-left flex items-center gap-2">
              <span className="text-base">🔔</span> Send Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
