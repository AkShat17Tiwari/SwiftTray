"use client";

import { motion } from "framer-motion";
import { UserCheck, CheckCircle, XCircle, Clock, Mail, Store } from "lucide-react";

const PENDING_VENDORS = [
  { id: "v1", name: "Rahul Sharma", email: "rahul@campus.edu", outlet: "Green Leaf Café", requestedAt: "2 hours ago", notes: "Experienced in campus catering for 3 years" },
  { id: "v2", name: "Priya Nair", email: "priya@campus.edu", outlet: "Juice Junction", requestedAt: "1 day ago", notes: "Fresh juice and smoothie specialist" },
];

const ACTIVE_VENDORS = [
  { id: "v3", name: "Amit Kumar", email: "amit@campus.edu", outlet: "Spice Junction", status: "active", orders: 1240, revenue: 245000, joinedAt: "Jan 2024" },
  { id: "v4", name: "Li Wei", email: "wei@campus.edu", outlet: "Dragon Bowl", status: "active", orders: 980, revenue: 196000, joinedAt: "Feb 2024" },
  { id: "v5", name: "Meera Devi", email: "meera@campus.edu", outlet: "South Express", status: "active", orders: 860, revenue: 172000, joinedAt: "Mar 2024" },
  { id: "v6", name: "Sarah Ahmed", email: "sarah@campus.edu", outlet: "Brew & Bite", status: "suspended", orders: 420, revenue: 84000, joinedAt: "Apr 2024" },
];

export default function AdminVendorsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">Vendor <span className="gradient-text">Management</span></h1>
        <p className="text-sm text-muted-foreground">Approve, manage, and monitor vendor accounts</p>
      </motion.div>

      {/* Pending Approvals */}
      {PENDING_VENDORS.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Approvals
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center justify-center">
              {PENDING_VENDORS.length}
            </span>
          </h2>
          <div className="space-y-3">
            {PENDING_VENDORS.map((vendor, i) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 border-l-2 border-l-amber-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">{vendor.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{vendor.email}</span>
                      <span className="flex items-center gap-1"><Store className="w-3 h-3" />{vendor.outlet}</span>
                      <span>{vendor.requestedAt}</span>
                    </div>
                    {vendor.notes && (
                      <p className="text-xs text-muted-foreground mt-2 bg-secondary/30 rounded-lg px-3 py-1.5">
                        💬 {vendor.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg gradient-success text-white text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium flex items-center gap-1 hover:bg-red-500/20 transition-colors">
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Active Vendors */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-500" />
          All Vendors
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
            <span className="col-span-3">Vendor</span>
            <span className="col-span-2">Outlet</span>
            <span className="col-span-1 text-center">Orders</span>
            <span className="col-span-2 text-center">Revenue</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          {ACTIVE_VENDORS.map((vendor, i) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              className="grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
            >
              <div className="col-span-3">
                <p className="font-medium text-sm">{vendor.name}</p>
                <p className="text-[10px] text-muted-foreground">{vendor.email}</p>
              </div>
              <span className="col-span-2 text-xs">{vendor.outlet}</span>
              <span className="col-span-1 text-center text-xs font-bold">{vendor.orders.toLocaleString()}</span>
              <span className="col-span-2 text-center text-xs font-bold text-emerald-500">₹{(vendor.revenue / 1000).toFixed(0)}k</span>
              <div className="col-span-2 flex justify-center">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  vendor.status === "active"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}>
                  {vendor.status === "active" ? "Active" : "Suspended"}
                </span>
              </div>
              <div className="col-span-2 flex justify-end gap-1">
                {vendor.status === "active" ? (
                  <button className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-medium hover:bg-red-500/20 transition-colors">
                    Suspend
                  </button>
                ) : (
                  <button className="px-2.5 py-1 rounded-lg gradient-success text-white text-[10px] font-medium">
                    Reactivate
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
