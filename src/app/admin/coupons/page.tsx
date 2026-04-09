"use client";

import { motion } from "framer-motion";
import { Tag, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const COUPONS = [
  { code: "CAMPUS20", type: "percentage", value: 20, minOrder: 150, maxDiscount: 100, used: 45, limit: 50, outlet: "All", active: true, expires: "Apr 30" },
  { code: "FIRST50", type: "flat", value: 50, minOrder: 200, maxDiscount: 50, used: 120, limit: 200, outlet: "All", active: true, expires: "May 15" },
  { code: "SPICE10", type: "percentage", value: 10, minOrder: 100, maxDiscount: 50, used: 28, limit: 100, outlet: "Spice Junction", active: true, expires: "Apr 20" },
  { code: "DRAGON15", type: "percentage", value: 15, minOrder: 180, maxDiscount: 75, used: 15, limit: 50, outlet: "Dragon Bowl", active: false, expires: "Mar 31" },
  { code: "WELCOME25", type: "flat", value: 25, minOrder: 100, maxDiscount: 25, used: 300, limit: 500, outlet: "All", active: true, expires: "Dec 31" },
];

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Coupon <span className="gradient-text">Management</span></h1>
          <p className="text-sm text-muted-foreground">{COUPONS.length} coupons configured</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-colored flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-extrabold text-emerald-500">{COUPONS.filter(c => c.active).length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-extrabold">{COUPONS.reduce((a, c) => a + c.used, 0)}</p>
          <p className="text-xs text-muted-foreground">Total Used</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-extrabold text-amber-500">{COUPONS.filter(c => c.used / c.limit > 0.8 && c.active).length}</p>
          <p className="text-xs text-muted-foreground">Near Limit</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
          <span className="col-span-2">Code</span>
          <span className="col-span-2">Discount</span>
          <span className="col-span-2">Min Order</span>
          <span className="col-span-1 text-center">Usage</span>
          <span className="col-span-2">Outlet</span>
          <span className="col-span-1 text-center">Status</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>
        {COUPONS.map((coupon, i) => (
          <motion.div
            key={coupon.code}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-12 gap-3 px-4 py-3 text-sm items-center hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
          >
            <span className="col-span-2 font-mono font-bold text-xs bg-primary/5 px-2 py-1 rounded-md w-fit">{coupon.code}</span>
            <span className="col-span-2 text-xs">
              {coupon.type === "percentage" ? `${coupon.value}% off` : `₹${coupon.value} off`}
              <span className="text-muted-foreground ml-1">(max ₹{coupon.maxDiscount})</span>
            </span>
            <span className="col-span-2 text-xs">{formatPrice(coupon.minOrder)}</span>
            <div className="col-span-1 text-center">
              <span className="text-xs font-bold">{coupon.used}/{coupon.limit}</span>
              <div className="w-full h-1 bg-secondary rounded-full mt-1">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(coupon.used / coupon.limit) * 100}%` }} />
              </div>
            </div>
            <span className="col-span-2 text-xs text-muted-foreground">{coupon.outlet}</span>
            <div className="col-span-1 flex justify-center">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                coupon.active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
              }`}>
                {coupon.active ? "Active" : "Expired"}
              </span>
            </div>
            <div className="col-span-2 flex justify-end gap-1">
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                {coupon.active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
              </button>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
