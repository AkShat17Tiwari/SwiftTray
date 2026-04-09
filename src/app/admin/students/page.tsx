"use client";

import { motion } from "framer-motion";
import { Users, ShoppingBag, Star, TrendingUp, Search, Eye, Ban, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

const STUDENT_STATS = [
  { label: "Total Students", value: "2,847", change: "+312", trend: "up" as const, icon: Users, color: "from-blue-500 to-cyan-500" },
  { label: "Active This Week", value: "1,024", change: "+8%", trend: "up" as const, icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
  { label: "Avg Orders/Student", value: "3.2", change: "+0.4", trend: "up" as const, icon: ShoppingBag, color: "from-indigo-500 to-purple-500" },
  { label: "Top Rated", value: "4.6 ★", change: "+0.1", trend: "up" as const, icon: Star, color: "from-amber-500 to-orange-500" },
];

const TOP_STUDENTS = [
  { name: "Arjun Patel", email: "arjun@campus.edu", orders: 48, spent: 12400, lastOrder: "2 hours ago", status: "active" },
  { name: "Sneha Reddy", email: "sneha@campus.edu", orders: 42, spent: 10800, lastOrder: "4 hours ago", status: "active" },
  { name: "Vikram Singh", email: "vikram@campus.edu", orders: 38, spent: 9600, lastOrder: "1 day ago", status: "active" },
  { name: "Ananya Sharma", email: "ananya@campus.edu", orders: 35, spent: 8400, lastOrder: "6 hours ago", status: "active" },
  { name: "Rohan Kumar", email: "rohan@campus.edu", orders: 32, spent: 7200, lastOrder: "3 days ago", status: "active" },
  { name: "Priya Menon", email: "priya.m@campus.edu", orders: 28, spent: 6800, lastOrder: "5 days ago", status: "active" },
  { name: "Karthik Nair", email: "karthik@campus.edu", orders: 25, spent: 5600, lastOrder: "1 week ago", status: "suspended" },
];

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">Student <span className="gradient-text">Activity</span></h1>
        <p className="text-sm text-muted-foreground">Monitor student engagement and ordering patterns</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STUDENT_STATS.map((s, i) => <StatCard key={s.label} {...s} delay={i} />)}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input placeholder="Search students..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
          <span className="col-span-3">Student</span>
          <span className="col-span-2 text-center">Orders</span>
          <span className="col-span-2 text-center">Total Spent</span>
          <span className="col-span-2">Last Order</span>
          <span className="col-span-1 text-center">Status</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>
        {TOP_STUDENTS.map((student, i) => (
          <motion.div
            key={student.email}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
          >
            <div className="col-span-3">
              <p className="font-medium text-sm">{student.name}</p>
              <p className="text-[10px] text-muted-foreground">{student.email}</p>
            </div>
            <span className="col-span-2 text-center text-xs font-bold">{student.orders}</span>
            <span className="col-span-2 text-center text-xs font-bold text-emerald-500">₹{student.spent.toLocaleString()}</span>
            <span className="col-span-2 text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{student.lastOrder}</span>
            <div className="col-span-1 flex justify-center">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                student.status === "active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}>{student.status === "active" ? "Active" : "Suspended"}</span>
            </div>
            <div className="col-span-2 flex justify-end gap-1">
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Eye className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"><Ban className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
