"use client";

import { useQuery } from "convex/react";
import { Clock, DollarSign, Repeat, ShoppingBag } from "lucide-react";
import { api } from "@convex/_generated/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatPrice } from "@/lib/utils";

export default function VendorAnalyticsPage() {
  const workspace = useQuery(api.dashboards.vendorWorkspace, {});
  if (workspace === undefined) return <p className="py-20 text-center text-sm text-muted-foreground">Loading live analytics…</p>;
  if (!workspace) return <p className="py-20 text-center text-sm text-muted-foreground">An approved outlet assignment is required.</p>;
  const stats = [
    { label: "Paid revenue", value: formatPrice(workspace.stats.revenue), change: `${formatPrice(workspace.stats.todaysRevenue)} today`, trend: "up" as const, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
    { label: "All orders", value: String(workspace.stats.totalOrders), change: `${workspace.stats.todaysOrders} today`, trend: "up" as const, icon: ShoppingBag, color: "from-indigo-500 to-purple-500" },
    { label: "Average prep", value: `${workspace.stats.avgPrepTime} min`, change: "outlet setting", trend: "up" as const, icon: Clock, color: "from-amber-500 to-orange-500" },
    { label: "Unique customers", value: String(workspace.stats.uniqueCustomers), change: `${formatPrice(workspace.stats.avgOrderValue)} avg order`, trend: "up" as const, icon: Repeat, color: "from-blue-500 to-cyan-500" },
  ];
  return <div className="space-y-6"><header><h1 className="text-2xl font-extrabold">Analytics & <span className="gradient-text">Insights</span></h1><p className="text-sm text-muted-foreground">Live paid-order metrics for {workspace.outlet.name}</p></header><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((stat, index) => <StatCard key={stat.label} {...stat} delay={index}/>)}</div><section><h2 className="text-lg font-bold mb-3">Top menu items</h2><div className="glass-card">{workspace.topItems.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">No paid item data yet.</p> : workspace.topItems.map((item, index) => <div key={item.id} className="flex gap-4 items-center px-4 py-3 border-b last:border-0"><span className="w-6 text-muted-foreground font-bold">{index + 1}</span><span className="flex-1 font-semibold">{item.name}</span><span className="text-sm text-muted-foreground">{item.orders} sold</span><span className="font-bold">{formatPrice(item.revenue)}</span></div>)}</div></section></div>;
}
