"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, DollarSign, Users, Store, Timer, TrendingDown,
  ChevronRight, AlertTriangle, Bell, Activity, ArrowUpRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { MOCK_ORDERS, MOCK_OUTLETS } from "@/lib/mock-data";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor, formatRelativeTime } from "@/lib/utils";

const PLATFORM_STATS = [
  { label: "Total Orders Today", value: "87", change: "+15%", trend: "up" as const, icon: ShoppingBag, color: "from-indigo-500 to-purple-500" },
  { label: "Platform Revenue", value: "₹34,800", change: "+22%", trend: "up" as const, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
  { label: "Active Students", value: "312", change: "+8%", trend: "up" as const, icon: Users, color: "from-blue-500 to-cyan-500" },
  { label: "Active Outlets", value: "12", change: "+2", trend: "up" as const, icon: Store, color: "from-amber-500 to-orange-500" },
  { label: "Avg Prep Time", value: "13 min", change: "-1 min", trend: "up" as const, icon: Timer, color: "from-pink-500 to-rose-500" },
  { label: "Cancel Rate", value: "3.2%", change: "-0.5%", trend: "up" as const, icon: TrendingDown, color: "from-red-500 to-orange-500" },
];

const ALERTS = [
  { type: "warning", message: "Dragon Bowl has 3 delayed orders (>20 min)", time: "5m ago" },
  { type: "info", message: "New vendor application: Green Leaf Café", time: "12m ago" },
  { type: "warning", message: "South Express running low on Sambar — 2 portions left", time: "18m ago" },
  { type: "info", message: "Coupon CAMPUS20 has been used 45/50 times", time: "30m ago" },
];

const OUTLET_LEADERBOARD = [
  { name: "Spice Junction", revenue: 12400, orders: 42, rating: 4.6 },
  { name: "Dragon Bowl", revenue: 9800, orders: 35, rating: 4.3 },
  { name: "South Express", revenue: 8200, orders: 31, rating: 4.8 },
  { name: "Brew & Bite", revenue: 6500, orders: 28, rating: 4.5 },
  { name: "Fresh Bowl", revenue: 4200, orders: 19, rating: 4.2 },
];

export default function AdminOverviewPage() {
  const recentOrders = MOCK_ORDERS.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">
              Platform <span className="gradient-text">Control Center</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Campus-wide overview • {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {PLATFORM_STATS.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i} />
        ))}
      </div>

      {/* Grid: Alerts + Leaderboard + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Live Alerts
            </h2>
            <span className="text-xs text-muted-foreground">{ALERTS.length} active</span>
          </div>
          <div className="space-y-2">
            {ALERTS.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`glass-card p-3 border-l-2 ${
                  alert.type === "warning" ? "border-l-amber-500" : "border-l-blue-500"
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                    alert.type === "warning" ? "text-amber-500" : "text-blue-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Outlet Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              🏆 Outlet Leaderboard
            </h2>
            <Link href="/admin/outlets" className="text-xs text-primary font-medium">View all</Link>
          </div>
          <div className="glass-card overflow-hidden">
            {OUTLET_LEADERBOARD.map((outlet, i) => (
              <motion.div
                key={outlet.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
              >
                <span className={`text-sm font-extrabold w-5 ${
                  i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{outlet.name}</p>
                  <p className="text-[10px] text-muted-foreground">{outlet.orders} orders • ⭐ {outlet.rating}</p>
                </div>
                <span className="text-sm font-bold text-emerald-500">{formatPrice(outlet.revenue)}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-primary font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">#{order.pickupToken}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{order.outletName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{formatPrice(order.totalAmount)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatRelativeTime(order._creationTime)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Manage Outlets", href: "/admin/outlets", icon: "🏪" },
            { label: "Approve Vendors", href: "/admin/vendors", icon: "✅" },
            { label: "View Analytics", href: "/admin/analytics", icon: "📊" },
            { label: "Send Announcement", href: "/admin/announcements", icon: "📢" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass-card p-4 text-center hover:border-primary/20 transition-colors cursor-pointer"
              >
                <span className="text-2xl">{action.icon}</span>
                <p className="text-xs font-medium mt-2">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
