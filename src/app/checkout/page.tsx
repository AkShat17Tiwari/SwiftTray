"use client";

import { useState } from "react";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cartLineKey, useCart } from "@/hooks/use-cart";
import { calculateTax, formatPrice } from "@/lib/utils";

type CheckoutStep = "review" | "pickup" | "payment";
const PICKUP_SLOTS = [
  "ASAP",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
];

function errorMessage(error: unknown): string {
  return error instanceof ConvexError
    ? String(error.data)
    : error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const liveOutletId =
    cart.outletId && !cart.outletId.startsWith("outlet_")
      ? (cart.outletId as Id<"outlets">)
      : null;
  const outlet = useQuery(
    api.outlets.getById,
    liveOutletId ? { id: liveOutletId } : "skip"
  );
  const placeOrder = useMutation(api.orders.place);
  const initiatePayment = useAction(api.payments.initiatePayment);
  const verifyPayment = useAction(api.payments.verifyPayment);

  const [step, setStep] = useState<CheckoutStep>("review");
  const [pickupSlot, setPickupSlot] = useState("ASAP");
  const [notes, setNotes] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<Id<"orders"> | null>(null);
  const [processing, setProcessing] = useState(false);

  const coupon = useQuery(
    api.coupons.validate,
    appliedPromo && liveOutletId
      ? { code: appliedPromo, orderAmount: cart.subtotal, outletId: liveOutletId }
      : "skip"
  );
  const discount = coupon?.valid ? coupon.discount ?? 0 : 0;
  const tax = calculateTax(cart.subtotal);
  const estimatedTotal = cart.subtotal + tax - discount;

  const invalidatePlacedOrder = () => setPlacedOrderId(null);
  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      toast.error("Enter a promo code first.");
      return;
    }
    setAppliedPromo(code);
    invalidatePlacedOrder();
  };

  const pay = async () => {
    if (!liveOutletId || !outlet) {
      toast.error("Outlet details are unavailable.");
      return;
    }
    if (!window.Razorpay) {
      toast.error("Razorpay Checkout is still loading. Please try again.");
      return;
    }
    setProcessing(true);
    try {
      let orderId = placedOrderId;
      if (!orderId) {
        orderId = await placeOrder({
          outletId: liveOutletId,
          items: cart.items.map((item) => ({
            menuItemId: item.menuItemId as Id<"menuItems">,
            quantity: item.quantity,
            customizations: item.customizations.map((customization) => ({
              name: customization.name,
              selected: customization.selected,
            })),
          })),
          couponCode: appliedPromo ?? undefined,
          pickupSlot,
          notes: notes.trim() || undefined,
        });
        setPlacedOrderId(orderId);
      }

      const checkout = await initiatePayment({ orderId });
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amountInPaise,
        currency: checkout.currency,
        name: "SwiftTray",
        description: `Order from ${checkout.outletName}`,
        order_id: checkout.razorpayOrderId,
        prefill: checkout.customer,
        notes: { swifttrayOrderId: String(orderId) },
        theme: { color: "#5DE5D5" },
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            cart.clearCart();
            router.push(`/payment/callback?order=${orderId}`);
          } catch (error) {
            toast.error(errorMessage(error));
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      razorpay.on("payment.failed", () => {
        toast.error("Payment was not completed. You can retry this saved order.");
        setProcessing(false);
      });
      if (checkout.keyId.startsWith("rzp_test_")) {
        toast.info(
          "Test Mode: Real UPI apps cannot scan sandbox QR codes. Select UPI ID and use 'success@razorpay' or use a test card.",
          { duration: 7000 }
        );
      }
      razorpay.open();
    } catch (error) {
      toast.error(errorMessage(error));
      setProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-2xl neu-pressed flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-9 h-9 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-sm text-muted-foreground mt-2 mb-6">Add an item from an open outlet to continue.</p>
            <Link href="/outlets" className="inline-flex min-h-11 px-6 rounded-xl neu-btn-primary items-center font-semibold text-[#1A2E35]">
              Browse outlets
            </Link>
          </div>
        </main>
        <MobileNav />
      </>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Navbar />
      <main className="flex-1 pt-20 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          <header className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => step === "review" ? router.back() : setStep(step === "payment" ? "pickup" : "review")}
              aria-label="Go back"
              className="w-11 h-11 rounded-xl neu-btn flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold">Secure checkout</h1>
              <p className="text-sm text-muted-foreground">{cart.outletName}</p>
            </div>
          </header>

          <ol className="grid grid-cols-3 gap-2" aria-label="Checkout progress">
            {(["review", "pickup", "payment"] as const).map((value, index) => (
              <li
                key={value}
                className={`min-h-10 rounded-xl flex items-center justify-center text-xs font-semibold ${
                  value === step ? "neu-pressed-sm text-primary" : "text-muted-foreground"
                }`}
              >
                {index + 1}. {value === "pickup" ? "Pickup" : value[0].toUpperCase() + value.slice(1)}
              </li>
            ))}
          </ol>

          {step === "review" && (
            <motion.section initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="neu-card-static p-5 space-y-4">
                <h2 className="font-bold">Your items</h2>
                {cart.items.map((item) => (
                  <div key={`${item.menuItemId}-${JSON.stringify(item.customizations)}`} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.customizations.map((value) => value.selected).join(", ") || "Standard"}
                      </p>
                      <p className="text-sm font-bold gradient-text mt-1">{formatPrice((item.price + item.customizations.reduce((sum, customization) => sum + customization.price, 0)) * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { cart.updateQuantity(cartLineKey(item), item.quantity - 1); invalidatePlacedOrder(); }}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="w-10 h-10 rounded-lg neu-btn flex items-center justify-center"
                      ><Minus className="w-3 h-3" /></button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => { cart.updateQuantity(cartLineKey(item), item.quantity + 1); invalidatePlacedOrder(); }}
                        aria-label={`Increase ${item.name} quantity`}
                        className="w-10 h-10 rounded-lg neu-btn flex items-center justify-center"
                      ><Plus className="w-3 h-3" /></button>
                      <button
                        type="button"
                        onClick={() => { cart.removeItem(cartLineKey(item)); invalidatePlacedOrder(); }}
                        aria-label={`Remove ${item.name}`}
                        className="w-10 h-10 rounded-lg text-[#E85D75] flex items-center justify-center"
                      ><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="neu-card-static p-5">
                <label htmlFor="promo" className="text-sm font-bold flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" /> Promo code
                </label>
                <div className="flex gap-2 mt-3">
                  <input
                    id="promo"
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value)}
                    maxLength={30}
                    className="flex-1 rounded-xl neu-input text-sm"
                    placeholder="Enter code"
                  />
                  <button type="button" onClick={applyPromo} className="min-h-11 px-4 rounded-xl neu-btn font-semibold text-sm">Apply</button>
                </div>
                {appliedPromo && coupon && (
                  <p className={`text-xs mt-2 ${coupon.valid ? "text-emerald-600" : "text-[#E85D75]"}`} role="status">
                    {coupon.valid ? `${appliedPromo} applied for ${formatPrice(discount)} off.` : coupon.error}
                  </p>
                )}
              </div>

              <PriceSummary subtotal={cart.subtotal} tax={tax} discount={discount} total={estimatedTotal} />
              <button type="button" onClick={() => setStep("pickup")} className="w-full min-h-12 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.section>
          )}

          {step === "pickup" && (
            <motion.section initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="neu-card-static p-5">
                <h2 className="font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Pickup time</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {PICKUP_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => { setPickupSlot(slot); invalidatePlacedOrder(); }}
                      aria-pressed={pickupSlot === slot}
                      className={`min-h-11 rounded-xl text-sm font-medium ${pickupSlot === slot ? "neu-pressed-sm text-primary" : "neu-btn"}`}
                    >{slot}</button>
                  ))}
                </div>
              </div>
              <div className="neu-card-static p-5">
                <label htmlFor="notes" className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Pickup notes</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => { setNotes(event.target.value); invalidatePlacedOrder(); }}
                  maxLength={500}
                  rows={3}
                  placeholder="Allergies or preparation notes"
                  className="w-full mt-3 rounded-xl neu-input text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">Pickup at {cart.outletName} · Main counter</p>
              </div>
              <button type="button" onClick={() => setStep("payment")} className="w-full min-h-12 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2">
                Review payment <ArrowRight className="w-4 h-4" />
              </button>
            </motion.section>
          )}

          {step === "payment" && (
            <motion.section initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="neu-card-static p-5 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl gradient-mint flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-[#1A2E35]" />
                </div>
                <div>
                  <h2 className="font-bold">Pay securely with Razorpay</h2>
                  <p className="text-sm text-muted-foreground mt-1">UPI, cards, netbanking, and supported wallets are available in Razorpay Checkout.</p>
                </div>
              </div>
              <PriceSummary subtotal={cart.subtotal} tax={tax} discount={discount} total={estimatedTotal} />
              <div className="flex items-start gap-2 text-xs text-muted-foreground px-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                The backend recalculates menu prices, coupon, tax, and total before creating the Razorpay order.
              </div>
              <button
                type="button"
                onClick={pay}
                disabled={processing}
                className="w-full min-h-12 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {processing ? "Opening Razorpay…" : `Pay ${formatPrice(estimatedTotal)}`}
              </button>
            </motion.section>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}

function PriceSummary({ subtotal, tax, discount, total }: { subtotal: number; tax: number; discount: number; total: number }) {
  return (
    <div className="neu-card-static p-5 space-y-2">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (5%)</span><span>{formatPrice(tax)}</span></div>
      {discount > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
      <div className="flex justify-between font-bold pt-3 mt-2 border-t border-[#C8D0E0]"><span>Estimated total</span><span className="gradient-text">{formatPrice(total)}</span></div>
    </div>
  );
}
