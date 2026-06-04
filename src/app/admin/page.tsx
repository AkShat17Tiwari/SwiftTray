"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronRight,
  DollarSign,
  Landmark,
  ShoppingBag,
  Store,
  TrendingDown,
  Users,
  Wallet,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  formatPrice,
  formatRelativeTime,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

type AdminOverview = {
  stats: {
    totalOrders: number;
    todaysOrders: number;
    platformRevenue: number;
    todaysRevenue: number;
    platformProfit: number;
    todaysProfit: number;
    activeStudents: number;
    activeOutlets: number;
    totalVendors: number;
    avgPrepTime: number;
    cancelRate: number;
    pendingVendors: number;
  };
  outletMetrics: {
    outletId: string;
    name: string;
    rating: number;
    orderCount: number;
    sales: number;
    platformProfit: number;
    vendorPayout: number;
  }[];
  vendorDetails: {
    id: string;
    outlet: string;
    email: string;
    status: string;
    orders: number;
    sales: number;
    profit: number;
    payout: number;
    commissionRate: number;
  }[];
  recentOrders: Order[];
};

export default function AdminOverviewPage() {
  const overview = useQuery(api.dashboards.adminOverview, {}) as
    | AdminOverview
    | undefined;

  if (!overview) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading platform analytics...
      </div>
    );
  }

  const stats = [
    {
      label: "Orders Today",
      value: overview.stats.todaysOrders.toString(),
      change: `${overview.stats.totalOrders} all-time`,
      trend: "up" as const,
      icon: ShoppingBag,
      color: "from-indigo-500 to-purple-500",
    },
    {
      label: "Sales Today",
      value: formatPrice(overview.stats.todaysRevenue),
      change: `${formatPrice(overview.stats.platformRevenue)} total`,
      trend: "up" as const,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Platform Profit",
      value: formatPrice(overview.stats.platformProfit),
      change: `${formatPrice(overview.stats.todaysProfit)} today`,
      trend: "up" as const,
      icon: Landmark,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Vendor Payouts",
      value: formatPrice(
        overview.vendorDetails.reduce((sum, vendor) => sum + vendor.payout, 0)
      ),
      change: `${overview.stats.totalVendors} vendors`,
      trend: "up" as const,
      icon: Wallet,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Active Outlets",
      value: overview.stats.activeOutlets.toString(),
      change: `${overview.outletMetrics.length} listed`,
      trend: "up" as const,
      icon: Store,
      color: "from-pink-500 to-rose-500",
    },
    {
      label: "Cancel Rate",
      value: `${overview.stats.cancelRate}%`,
      change: `${overview.stats.avgPrepTime}m avg prep`,
      trend: "up" as const,
      icon: TrendingDown,
      color: "from-red-500 to-orange-500",
    },
  ];

  const alerts = [
    overview.stats.pendingVendors > 0
      ? `${overview.stats.pendingVendors} vendor approval request${overview.stats.pendingVendors === 1 ? "" : "s"} waiting`
      : "No pending vendor approvals",
    overview.stats.cancelRate > 5
      ? `Cancellation rate is elevated at ${overview.stats.cancelRate}%`
      : "Cancellation rate is within target",
    `${overview.stats.activeOutlets} outlet${overview.stats.activeOutlets === 1 ? "" : "s"} currently accepting orders`,
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">
              Platform <span className="gradient-text">Control Center</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Sales, vendors, payouts, profit, and live order health
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">
              Admin verified
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Live Signals
            </h2>
          </div>
          <div className="space-y-2">
            {alerts.map((message, index) => (
              <motion.div
                key={message}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass-card p-3 border-l-2 border-l-amber-500"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs leading-relaxed">{message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Outlet Sales</h2>
            <Link href="/admin/outlets" className="text-xs text-primary font-medium">
              View all
            </Link>
          </div>
          <div className="glass-card overflow-hidden">
            {overview.outletMetrics.slice(0, 6).map((outlet, index) => (
              <motion.div
                key={outlet.outletId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
              >
                <span className="text-sm font-extrabold w-5 text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{outlet.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {outlet.orderCount} orders • profit {formatPrice(outlet.platformProfit)}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-500">
                  {formatPrice(outlet.sales)}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
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
            {overview.recentOrders.slice(0, 6).map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="glass-card p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">#{order.pickupToken}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${getOrderStatusColor(order.status as OrderStatus)}`}>
                        {getOrderStatusLabel(order.status as OrderStatus)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {order.outletName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{formatPrice(order.totalAmount)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(order._creationTime)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Vendor Details
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
            <span className="col-span-3">Vendor</span>
            <span className="col-span-2 text-center">Sales</span>
            <span className="col-span-2 text-center">Profit</span>
            <span className="col-span-2 text-center">Payout</span>
            <span className="col-span-1 text-center">Orders</span>
            <span className="col-span-2 text-right">Commission</span>
          </div>
          {overview.vendorDetails.map((vendor) => (
            <div
              key={vendor.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
            >
              <div className="col-span-3 min-w-0">
                <p className="font-medium text-sm truncate">{vendor.outlet}</p>
                <p className="text-[10px] text-muted-foreground truncate">{vendor.email}</p>
              </div>
              <span className="col-span-2 text-center text-xs font-bold">
                {formatPrice(vendor.sales)}
              </span>
              <span className="col-span-2 text-center text-xs font-bold text-emerald-500">
                {formatPrice(vendor.profit)}
              </span>
              <span className="col-span-2 text-center text-xs font-bold">
                {formatPrice(vendor.payout)}
              </span>
              <span className="col-span-1 text-center text-xs">{vendor.orders}</span>
              <span className="col-span-2 text-right text-xs text-muted-foreground">
                {vendor.commissionRate}%
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
