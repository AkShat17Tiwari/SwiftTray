"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Mail, Store, UserCheck, Wallet } from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatPrice } from "@/lib/utils";

type VendorRow = {
  id: string;
  outlet: string;
  email: string;
  status: string;
  orders: number;
  sales: number;
  profit: number;
  payout: number;
  commissionRate: number;
};

type AdminOverview = {
  stats: { totalVendors: number; pendingVendors: number };
  vendorDetails: VendorRow[];
};

export default function AdminVendorsPage() {
  const overview = useQuery(api.dashboards.adminOverview, {}) as
    | AdminOverview
    | undefined;

  if (!overview) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading vendor details...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold">
            Vendor <span className="gradient-text">Management</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {overview.stats.totalVendors} vendors • {overview.stats.pendingVendors} pending approvals
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
          <Wallet className="w-3.5 h-3.5" />
          Live payouts
        </div>
      </motion.div>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-500" />
          All Vendors
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
            <span className="col-span-3">Vendor / Outlet</span>
            <span className="col-span-2 text-center">Sales</span>
            <span className="col-span-2 text-center">Platform Profit</span>
            <span className="col-span-2 text-center">Vendor Payout</span>
            <span className="col-span-1 text-center">Orders</span>
            <span className="col-span-2 text-right">Commission</span>
          </div>
          {overview.vendorDetails.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 + index * 0.03 }}
              className="grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
            >
              <div className="col-span-3 min-w-0">
                <p className="font-medium text-sm truncate flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-muted-foreground" />
                  {vendor.outlet}
                </p>
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3 h-3" />
                  {vendor.email}
                </p>
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
