"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle,
  ChefHat,
  ChevronRight,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  Store,
  Timer,
  TrendingUp,
  Users,
  X as XIcon,
  Zap,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  formatPrice,
  formatRelativeTime,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/utils";
import type { Order, Outlet } from "@/types";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";

type VendorOrder = Order & { _id: Id<"orders"> };

type VendorWorkspace = {
  outlet: Outlet;
  stats: {
    totalOrders: number;
    todaysOrders: number;
    revenue: number;
    todaysRevenue: number;
    activeOrders: number;
    avgPrepTime: number;
    uniqueCustomers: number;
    avgOrderValue: number;
    availableItems: number;
    totalItems: number;
  };
  activeOrders: VendorOrder[];
  recentOrders: VendorOrder[];
  topItems: {
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }[];
};

export function VendorDashboardOverview() {
  const { user } = useUser();
  const workspace = useQuery(
    api.dashboards.vendorWorkspace,
    user?.id ? { vendorUserId: user.id } : "skip"
  ) as VendorWorkspace | null | undefined;
  const updateStatus = useMutation(api.orders.updateStatus);

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

  if (workspace === undefined) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading your vendor workspace...
      </div>
    );
  }

  if (workspace === null) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">No outlet assigned</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Verify with your vendor workspace key to unlock your individual dashboard.
        </p>
        <Link href="/vendor/access">
          <button className="px-5 py-2.5 rounded-xl neu-btn-primary text-[#1A2E35] text-sm font-semibold">
            Enter Vendor Key
          </button>
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Today's Orders",
      value: workspace.stats.todaysOrders.toString(),
      change: `${workspace.stats.totalOrders} total`,
      trend: "up" as const,
      icon: ShoppingBag,
      color: "from-indigo-500 to-purple-500",
    },
    {
      label: "Revenue Today",
      value: formatPrice(workspace.stats.todaysRevenue),
      change: `${formatPrice(workspace.stats.revenue)} total`,
      trend: "up" as const,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Avg Prep Time",
      value: `${workspace.stats.avgPrepTime} min`,
      change: `${workspace.stats.activeOrders} active`,
      trend: "up" as const,
      icon: Timer,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Customers",
      value: workspace.stats.uniqueCustomers.toString(),
      change: `${formatPrice(workspace.stats.avgOrderValue)} avg`,
      trend: "up" as const,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
                Vendor Portal
              </span>
              <h1 className="text-2xl font-extrabold">
                {workspace.outlet.name} <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {workspace.outlet.location} • {workspace.stats.availableItems}/{workspace.stats.totalItems} menu items live
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-500 font-medium">
              {workspace.outlet.isOpen ? "Outlet Open" : "Outlet Closed"}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Incoming Orders
              {workspace.activeOrders.length > 0 && (
                <span className="w-5 h-5 rounded-full gradient-warm text-white text-[10px] font-bold inline-flex items-center justify-center">
                  {workspace.activeOrders.length}
                </span>
              )}
            </h2>
            <Link href="/vendor/orders" className="text-sm text-primary font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {workspace.activeOrders.slice(0, 5).map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">#{order.pickupToken}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getOrderStatusColor(order.status)}`}>
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
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium flex items-center gap-1 hover:bg-red-500/20 transition-colors"
                        >
                          <XIcon className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <button
                        onClick={() => handleStatus(order._id, "preparing")}
                        className="px-3 py-1.5 rounded-lg gradient-warm text-white text-xs font-medium flex items-center gap-1"
                      >
                        <ChefHat className="w-3 h-3" /> Start Prep
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button
                        onClick={() => handleStatus(order._id, "ready")}
                        className="px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-medium flex items-center gap-1"
                      >
                        <Package className="w-3 h-3" /> Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {workspace.activeOrders.length === 0 && (
              <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                No active orders for this outlet right now.
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Top Selling
          </h2>
          <div className="glass-card overflow-hidden">
            {workspace.topItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
              >
                <span className="text-xs font-bold text-muted-foreground w-4">
                  {index + 1}
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

          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground mb-2">Quick Actions</h3>
            <Link href="/vendor/menu">
              <button className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-card/50 text-sm font-medium hover:bg-card transition-colors text-left flex items-center gap-2">
                <span className="text-base">+</span> Add Menu Item
              </button>
            </Link>
            <Link href="/vendor/analytics">
              <button className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-card/50 text-sm font-medium hover:bg-card transition-colors text-left flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> View Analytics
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
