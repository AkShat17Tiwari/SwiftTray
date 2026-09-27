"use client";

import { useQuery } from "convex/react";
import { DollarSign, ShoppingBag, Store, Users } from "lucide-react";
import { api } from "@convex/_generated/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatPrice } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const overview = useQuery(api.dashboards.adminOverview, {});
  if (!overview) return <p className="py-20 text-center text-sm text-muted-foreground">Loading live analytics…</p>;
  const stats = [
    { label: "Paid revenue", value: formatPrice(overview.stats.platformRevenue), change: `${formatPrice(overview.stats.todaysRevenue)} today`, trend: "up" as const, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
    { label: "All orders", value: String(overview.stats.totalOrders), change: `${overview.stats.todaysOrders} today`, trend: "up" as const, icon: ShoppingBag, color: "from-indigo-500 to-purple-500" },
    { label: "Active students", value: String(overview.stats.activeStudents), change: "current accounts", trend: "up" as const, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Open outlets", value: String(overview.stats.activeOutlets), change: `${overview.outletMetrics.length} configured`, trend: "up" as const, icon: Store, color: "from-amber-500 to-orange-500" },
  ];
  return <div className="space-y-6"><header><h1 className="text-2xl font-extrabold">Platform <span className="gradient-text">Analytics</span></h1><p className="text-sm text-muted-foreground">Calculated from live paid orders and accounts</p></header><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((stat, index) => <StatCard key={stat.label} {...stat} delay={index}/>)}</div><section><h2 className="text-lg font-bold mb-3">Outlet performance</h2><div className="glass-card overflow-x-auto"><div className="min-w-[620px]"><div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground border-b"><span className="col-span-4">Outlet</span><span className="col-span-2 text-center">Paid orders</span><span className="col-span-2 text-right">Sales</span><span className="col-span-2 text-right">Platform</span><span className="col-span-2 text-right">Payout</span></div>{overview.outletMetrics.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">No outlet data yet.</p> : overview.outletMetrics.map((outlet) => <div key={outlet.outletId} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm border-b last:border-0"><span className="col-span-4 font-semibold">{outlet.name}</span><span className="col-span-2 text-center">{outlet.orderCount}</span><span className="col-span-2 text-right">{formatPrice(outlet.sales)}</span><span className="col-span-2 text-right text-emerald-600">{formatPrice(outlet.platformProfit)}</span><span className="col-span-2 text-right">{formatPrice(outlet.vendorPayout)}</span></div>)}</div></div></section></div>;
}
