"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, Users, ShoppingBag, TrendingUp, Repeat, Clock } from "lucide-react";

const DAILY_REVENUE = [
  { date: "Apr 1", revenue: 18200, orders: 48 },
  { date: "Apr 2", revenue: 22400, orders: 56 },
  { date: "Apr 3", revenue: 19800, orders: 51 },
  { date: "Apr 4", revenue: 28600, orders: 72 },
  { date: "Apr 5", revenue: 25100, orders: 63 },
  { date: "Apr 6", revenue: 32400, orders: 82 },
  { date: "Apr 7", revenue: 29800, orders: 74 },
];

const OUTLET_COMPARISON = [
  { name: "Spice Junction", revenue: 12400 },
  { name: "Dragon Bowl", revenue: 9800 },
  { name: "South Express", revenue: 8200 },
  { name: "Brew & Bite", revenue: 6500 },
  { name: "Fresh Bowl", revenue: 4200 },
  { name: "Pizza Planet", revenue: 3800 },
];

const STUDENT_RETENTION = [
  { week: "W1", newUsers: 45, returning: 28 },
  { week: "W2", newUsers: 52, returning: 38 },
  { week: "W3", newUsers: 38, returning: 45 },
  { week: "W4", newUsers: 41, returning: 52 },
];

const ORDER_DISTRIBUTION = [
  { name: "Completed", value: 68, color: "#10b981" },
  { name: "Preparing", value: 14, color: "#f59e0b" },
  { name: "Ready", value: 8, color: "#6366f1" },
  { name: "Cancelled", value: 6, color: "#ef4444" },
  { name: "Pending", value: 4, color: "#8b5cf6" },
];

const PEAK_MAP = [
  { hour: "8AM", Mon: 5, Tue: 8, Wed: 6, Thu: 7, Fri: 9 },
  { hour: "10AM", Mon: 12, Tue: 15, Wed: 10, Thu: 14, Fri: 18 },
  { hour: "12PM", Mon: 38, Tue: 42, Wed: 35, Thu: 40, Fri: 45 },
  { hour: "1PM", Mon: 45, Tue: 48, Wed: 42, Thu: 46, Fri: 50 },
  { hour: "2PM", Mon: 28, Tue: 30, Wed: 25, Thu: 32, Fri: 35 },
  { hour: "4PM", Mon: 15, Tue: 18, Wed: 14, Thu: 16, Fri: 22 },
  { hour: "6PM", Mon: 32, Tue: 35, Wed: 30, Thu: 34, Fri: 38 },
  { hour: "8PM", Mon: 20, Tue: 22, Wed: 18, Thu: 24, Fri: 28 },
];

const STATS = [
  { label: "Weekly Revenue", value: "₹1.76L", change: "+22%", trend: "up" as const, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
  { label: "Weekly Orders", value: "446", change: "+15%", trend: "up" as const, icon: ShoppingBag, color: "from-indigo-500 to-purple-500" },
  { label: "New Students", value: "176", change: "+31%", trend: "up" as const, icon: Users, color: "from-blue-500 to-cyan-500" },
  { label: "Retention Rate", value: "72%", change: "+5%", trend: "up" as const, icon: Repeat, color: "from-pink-500 to-rose-500" },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">Platform <span className="gradient-text">Analytics</span></h1>
        <p className="text-sm text-muted-foreground">Campus-wide performance metrics and insights</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} {...s} delay={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <ChartCard title="Daily Revenue" subtitle="Last 7 days" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_REVENUE}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#adminRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Outlet Comparison */}
        <ChartCard title="Outlet Revenue Comparison" subtitle="This week">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={OUTLET_COMPARISON} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Order Distribution */}
        <ChartCard title="Order Status Distribution" subtitle="This week">
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ORDER_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {ORDER_DISTRIBUTION.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {ORDER_DISTRIBUTION.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-bold">{s.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Student Retention */}
        <ChartCard title="Student Retention" subtitle="New vs Returning users">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={STUDENT_RETENTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} name="New Users" />
                <Line type="monotone" dataKey="returning" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} name="Returning" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Peak Hours Heatmap */}
        <ChartCard title="Peak Order Hours" subtitle="Weekday heatmap">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PEAK_MAP}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="Mon" stackId="a" fill="#6366f1" barSize={14} />
                <Bar dataKey="Tue" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="Wed" stackId="a" fill="#a78bfa" />
                <Bar dataKey="Thu" stackId="a" fill="#c4b5fd" />
                <Bar dataKey="Fri" stackId="a" fill="#ddd6fe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
