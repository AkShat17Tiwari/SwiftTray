"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, TrendingUp, Clock, ShoppingBag, Users, Repeat } from "lucide-react";

const REVENUE_DATA = [
  { day: "Mon", revenue: 6045, orders: 18 },
  { day: "Tue", revenue: 7440, orders: 22 },
  { day: "Wed", revenue: 4185, orders: 13 },
  { day: "Thu", revenue: 8556, orders: 26 },
  { day: "Fri", revenue: 7254, orders: 21 },
  { day: "Sat", revenue: 9300, orders: 30 },
  { day: "Sun", revenue: 7905, orders: 24 },
];

const TOP_ITEMS_DATA = [
  { name: "Biryani", orders: 48 },
  { name: "Butter Chicken", orders: 42 },
  { name: "Dosa", orders: 38 },
  { name: "Noodles", orders: 35 },
  { name: "Coffee", orders: 32 },
];

const PEAK_HOURS = [
  { hour: "8 AM", orders: 8 },
  { hour: "10 AM", orders: 15 },
  { hour: "12 PM", orders: 38 },
  { hour: "1 PM", orders: 42 },
  { hour: "2 PM", orders: 28 },
  { hour: "4 PM", orders: 18 },
  { hour: "6 PM", orders: 32 },
  { hour: "8 PM", orders: 22 },
];

const ORDER_STATUS = [
  { name: "Completed", value: 72, color: "#10b981" },
  { name: "Preparing", value: 12, color: "#f59e0b" },
  { name: "Cancelled", value: 8, color: "#ef4444" },
  { name: "Pending", value: 8, color: "#6366f1" },
];

const STATS = [
  { label: "Weekly Revenue", value: "₹50,685", change: "+18%", trend: "up" as const, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
  { label: "Total Orders", value: "154", change: "+12%", trend: "up" as const, icon: ShoppingBag, color: "from-indigo-500 to-purple-500" },
  { label: "Avg Prep Time", value: "11 min", change: "-2 min", trend: "up" as const, icon: Clock, color: "from-amber-500 to-orange-500" },
  { label: "Repeat Rate", value: "68%", change: "+5%", trend: "up" as const, icon: Repeat, color: "from-blue-500 to-cyan-500" },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-bold">{label}</p>
        <p className="text-xs text-primary">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function VendorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold mb-1">
            Analytics & <span className="gradient-text">Insights</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Performance metrics for Spice Junction
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          {(["7d", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {r === "7d" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend" subtitle="Last 7 days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top Items */}
        <ChartCard title="Top Items" subtitle="By order volume">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_ITEMS_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Peak Hours */}
        <ChartCard title="Peak Hours" subtitle="Orders by hour">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PEAK_HOURS}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]} barSize={24}>
                  {PEAK_HOURS.map((entry, idx) => (
                    <Cell key={idx} fill={entry.orders > 35 ? "#f59e0b" : entry.orders > 20 ? "#6366f1" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Order Status */}
        <ChartCard title="Order Status" subtitle="Distribution this week">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ORDER_STATUS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ORDER_STATUS.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {ORDER_STATUS.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-bold">{s.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
