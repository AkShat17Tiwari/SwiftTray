"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  KeyRound,
  Mail,
  RefreshCw,
  Store,
  UserCheck,
  Wallet,
  X,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";

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

type IssuedCode = {
  loginCode: string;
  vendorName: string;
  vendorEmail: string;
};

export default function AdminVendorsPage() {
  const overview = useQuery(api.dashboards.adminOverview, {}) as
    | AdminOverview
    | undefined;
  const pending = useQuery(api.vendorAssignments.listPending, {});
  const vendorUsers = useQuery(api.users.listByRole, { role: "vendor" });
  const approve = useMutation(api.vendorAssignments.approve);
  const reject = useMutation(api.vendorAssignments.reject);
  const regenerateCode = useMutation(api.portalAccess.regenerateVendorCode);
  const [issuedCode, setIssuedCode] = useState<IssuedCode | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const decide = async (assignmentId: Id<"vendorAssignments">, accepted: boolean) => {
    try {
      if (accepted) {
        const result = await approve({ assignmentId });
        setIssuedCode(result);
      } else {
        await reject({ assignmentId, notes: "Declined by administrator" });
      }
      toast.success(accepted ? "Vendor access approved" : "Vendor request declined");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update request");
    }
  };

  const regenerate = async (userId: Id<"users">) => {
    setRegeneratingId(userId);
    try {
      const result = await regenerateCode({ userId });
      setIssuedCode(result);
      toast.success("A new vendor login code was issued");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not regenerate the code");
    } finally {
      setRegeneratingId(null);
    }
  };

  const copyIssuedCode = async () => {
    if (!issuedCode) return;
    await navigator.clipboard.writeText(issuedCode.loginCode);
    toast.success("Vendor login code copied");
  };

  if (!overview) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading vendor details...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {issuedCode && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 px-4 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vendor-code-title"
        >
          <section className="w-full max-w-md neu-card-static p-6 relative">
            <button
              type="button"
              onClick={() => setIssuedCode(null)}
              aria-label="Close vendor login code"
              className="absolute right-4 top-4 w-11 h-11 rounded-xl neu-btn flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl gradient-warning flex items-center justify-center mb-5">
              <KeyRound className="w-6 h-6 text-[#1A2E35]" />
            </div>
            <h2 id="vendor-code-title" className="text-xl font-extrabold pr-12">
              Vendor login code issued
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Give this code securely to {issuedCode.vendorName} ({issuedCode.vendorEmail}).
              It will not be shown again after this window closes.
            </p>
            <div className="mt-5 p-4 rounded-2xl neu-pressed text-center">
              <code className="font-mono text-3xl font-extrabold tracking-[0.35em]">
                {issuedCode.loginCode}
              </code>
            </div>
            <button
              type="button"
              onClick={copyIssuedCode}
              className="w-full min-h-12 mt-5 rounded-xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy code
            </button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Regenerating a code immediately invalidates the previous one.
            </p>
          </section>
        </div>
      )}
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

      <section>
        <h2 className="text-lg font-bold mb-4">Pending access requests</h2>
        <div className="space-y-3">
          {pending === undefined ? (
            <p className="text-sm text-muted-foreground">Loading requests…</p>
          ) : pending.length === 0 ? (
            <p className="glass-card p-5 text-sm text-muted-foreground">No vendor requests are waiting.</p>
          ) : pending.map((request) => (
            <div key={request._id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold">{request.userName}</p>
                <p className="text-xs text-muted-foreground">{request.userEmail} · {request.outletName}</p>
                {request.notes && <p className="text-sm mt-2">{request.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => decide(request._id, true)} className="min-h-10 px-3 rounded-xl bg-emerald-500/10 text-emerald-700 text-xs font-semibold flex items-center gap-2"><Check className="w-4 h-4"/>Approve</button>
                <button type="button" onClick={() => decide(request._id, false)} className="min-h-10 px-3 rounded-xl bg-red-500/10 text-red-700 text-xs font-semibold flex items-center gap-2"><X className="w-4 h-4"/>Decline</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" /> Vendor login codes
        </h2>
        <div className="space-y-3">
          {vendorUsers === undefined ? (
            <p className="text-sm text-muted-foreground">Loading vendor accounts…</p>
          ) : vendorUsers.length === 0 ? (
            <p className="glass-card p-5 text-sm text-muted-foreground">
              No approved vendor accounts yet.
            </p>
          ) : (
            vendorUsers.map((vendor) => (
              <div
                key={vendor._id}
                className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{vendor.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vendor.vendorLoginCodeIssuedAt
                      ? `Code issued ${new Date(vendor.vendorLoginCodeIssuedAt).toLocaleDateString()}`
                      : "No login code has been issued"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => regenerate(vendor._id)}
                  disabled={regeneratingId === vendor._id}
                  className="min-h-11 px-4 rounded-xl neu-btn text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${regeneratingId === vendor._id ? "animate-spin" : ""}`}
                  />
                  {vendor.vendorLoginCodeIssuedAt ? "Regenerate code" : "Issue code"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

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
