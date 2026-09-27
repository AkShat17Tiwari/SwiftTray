"use client";

import { Suspense, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
  RotateCcw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { formatPrice } from "@/lib/utils";

function CallbackContent() {
  const params = useSearchParams();
  const value = params.get("order");
  const orderId = value ? (value as Id<"orders">) : null;
  const state = useQuery(
    api.payments.getPaymentState,
    orderId ? { orderId } : "skip"
  );
  const initiatePayment = useAction(api.payments.initiatePayment);
  const verifyPayment = useAction(api.payments.verifyPayment);
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    if (!orderId || !window.Razorpay) {
      toast.error("Razorpay Checkout is still loading.");
      return;
    }
    setRetrying(true);
    try {
      const checkout = await initiatePayment({ orderId });
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amountInPaise,
        currency: checkout.currency,
        name: "SwiftTray",
        description: `Order from ${checkout.outletName}`,
        order_id: checkout.razorpayOrderId,
        prefill: checkout.customer,
        theme: { color: "#5DE5D5" },
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment captured");
          } catch {
            toast.error("Payment could not be verified. It was not marked paid.");
          } finally {
            setRetrying(false);
          }
        },
        modal: { ondismiss: () => setRetrying(false) },
      });
      razorpay.open();
    } catch {
      toast.error("Could not restart Razorpay Checkout.");
      setRetrying(false);
    }
  };

  const status =
    state === undefined
      ? "loading"
      : state === null
        ? "invalid"
        : state.paymentStatus === "completed"
          ? "paid"
          : state.paymentStatus === "failed"
            ? "failed"
            : "pending";

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Navbar />
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-md mx-auto px-4 text-center">
          {status === "loading" && (
            <StatusPanel icon={<Loader2 className="w-11 h-11 text-primary animate-spin" />} title="Checking payment…" body="Loading the latest gateway status." />
          )}
          {status === "paid" && state && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="w-24 h-24 rounded-3xl gradient-success flex items-center justify-center mx-auto shadow-mint-glow">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div><h1 className="text-2xl font-extrabold">Payment captured</h1><p className="text-muted-foreground mt-1">Your order is ready for the outlet to accept.</p></div>
              {state.pickupToken && (
                <div className="neu-card-static p-6">
                  <p className="text-xs text-muted-foreground">Pickup token</p>
                  <p className="text-5xl font-extrabold gradient-text tracking-[0.2em] mt-2">{state.pickupToken}</p>
                </div>
              )}
              <Link href={orderId ? `/orders/${orderId}` : "/orders"} className="min-h-12 rounded-xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2">
                Track order <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
          {status === "failed" && state && (
            <StatusPanel
              icon={<XCircle className="w-11 h-11 text-[#E85D75]" />}
              title="Payment failed"
              body={`Your order is saved. Amount due: ${formatPrice(state.totalAmount)}.`}
              action={<RetryButton onClick={retry} pending={retrying} />}
            />
          )}
          {status === "pending" && state && (
            <StatusPanel
              icon={<Clock className="w-11 h-11 text-amber-500" />}
              title="Payment awaiting confirmation"
              body="If you closed Checkout, you can resume the same payment attempt. Webhook confirmation will update this page automatically."
              action={<RetryButton onClick={retry} pending={retrying} />}
            />
          )}
          {status === "invalid" && (
            <StatusPanel
              icon={<ShoppingBag className="w-11 h-11 text-muted-foreground" />}
              title="Payment not found"
              body="This order does not exist or you do not have access to it."
              action={<Link href="/orders" className="inline-flex min-h-11 px-6 rounded-xl neu-btn-primary items-center font-semibold text-[#1A2E35]">My orders</Link>}
            />
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}

function RetryButton({ onClick, pending }: { onClick: () => void; pending: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={pending} className="inline-flex min-h-11 px-6 rounded-xl neu-btn-primary items-center gap-2 font-semibold text-[#1A2E35] disabled:opacity-60">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
      Retry with Razorpay
    </button>
  );
}

function StatusPanel({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="space-y-5 py-8">
      <div className="w-20 h-20 rounded-2xl neu-pressed flex items-center justify-center mx-auto">{icon}</div>
      <div><h1 className="text-xl font-bold">{title}</h1><p className="text-sm text-muted-foreground mt-2">{body}</p></div>
      {action}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <CallbackContent />
    </Suspense>
  );
}
