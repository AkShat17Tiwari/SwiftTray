"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, ShoppingBag, Clock, MapPin, Tag, Shield,
  CheckCircle, X, Minus, Plus, CreditCard, Banknote, Smartphone,
  Ticket, Loader2,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, calculateTax, generatePickupToken } from "@/lib/utils";
import { api } from "@convex/_generated/api";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Outlet } from "@/types";
import type { Id } from "@convex/_generated/dataModel";

type CheckoutStep = "review" | "details" | "payment" | "confirmation";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI / QR", icon: Smartphone, desc: "Google Pay, PhonePe" },
  { id: "card", label: "Card", icon: CreditCard, desc: "Debit / Credit Card" },
  { id: "cash", label: "Cash", icon: Banknote, desc: "Pay at counter" },
];

const PICKUP_SLOTS = ["ASAP", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM"];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, outletId, outletName, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const canLoadOutlet = outletId ? !outletId.startsWith("outlet_") : false;
  const liveOutletId = canLoadOutlet && outletId ? (outletId as Id<"outlets">) : null;
  const outlet = useQuery(
    api.outlets.getById,
    liveOutletId ? { id: liveOutletId } : "skip"
  ) as Outlet | null | undefined;
  const placeOrder = useMutation(api.orders.place);
  const tax = calculateTax(subtotal);
  const [step, setStep] = useState<CheckoutStep>("review");
  const [pickupSlot, setPickupSlot] = useState("ASAP");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickupToken, setPickupToken] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const total = subtotal + tax - discount;

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "SWIFT10") {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      toast.success(`Promo applied! ₹${disc} off`);
    } else {
      toast.error("Invalid promo code");
    }
  };

  const processPayment = async () => {
    if (!liveOutletId || !outlet) {
      toast.error("Outlet details are still loading");
      return;
    }

    setIsProcessing(true);
    try {
      const token = generatePickupToken();
      const newOrderId = await placeOrder({
        userId: user?.id ?? "guest",
        outletId: liveOutletId,
        outletName: outlet.name,
        outletImage: outlet.image,
        items: items.map(({ specialInstructions: _specialInstructions, ...item }) => item),
        subtotal,
        tax,
        discount,
        totalAmount: total,
        couponCode: discount > 0 ? promoCode.toUpperCase() : undefined,
        pickupSlot,
        pickupToken: token,
        notes: specialInstructions || undefined,
        paymentStatus: paymentMethod === "cash" ? "pending" : "completed",
      });

      setPickupToken(token);
      setOrderId(newOrderId);
      setStep("confirmation");
      toast.success("Order placed");
    } catch {
      toast.error("Could not place your order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && step !== "confirmation") {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-2xl neu-pressed flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add items from an outlet to get started</p>
            <Link href="/outlets">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-xl neu-btn-primary text-[#1A2E35] font-semibold"
              >
                Browse Outlets
              </motion.button>
            </Link>
          </div>
        </main>
        <MobileNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Header */}
          {step !== "confirmation" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (step === "review") router.back();
                  else if (step === "details") setStep("review");
                  else if (step === "payment") setStep("details");
                }}
                className="w-9 h-9 rounded-full neu-btn flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-bold">Checkout</h1>
                <p className="text-xs text-muted-foreground">
                  {outletName && `From ${outletName}`}
                </p>
              </div>
            </div>
          )}

          {/* Stepper */}
          {step !== "confirmation" && (
            <div className="flex items-center gap-2">
              {(["review", "details", "payment"] as CheckoutStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s
                        ? "gradient-mint text-[#1A2E35] shadow-neu-sm"
                        : i < ["review", "details", "payment"].indexOf(step)
                        ? "gradient-mint text-[#1A2E35] shadow-neu-sm"
                        : "neu-pressed-sm text-muted-foreground"
                    }`}
                  >
                    {i < ["review", "details", "payment"].indexOf(step) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-0.5 rounded-full ${
                        i < ["review", "details", "payment"].indexOf(step)
                          ? "bg-primary"
                          : "shadow-[inset_1px_1px_2px_rgba(163,177,198,0.4),inset_-1px_-1px_2px_#FFFFFF]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ──────── STEP 1: REVIEW ──────── */}
            {step === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="neu-card-static p-5 space-y-4">
                  <h2 className="text-sm font-bold">Your Items</h2>
                  {items.map((item) => (
                    <div key={item.menuItemId} className="flex gap-3 items-start">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-neu-sm">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{item.name}</h3>
                        {item.customizations.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.customizations.map((c) => c.selected).join(", ")}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-bold gradient-text">
                            {formatPrice(
                              (item.price + item.customizations.reduce((s, c) => s + c.price, 0)) * item.quantity
                            )}
                          </span>
                          <div className="neu-stepper">
                            <button
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              className="neu-stepper-btn w-7 h-7"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                              className="neu-stepper-btn w-7 h-7 gradient-mint text-[#1A2E35]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                <div className="neu-card-static p-5">
                  <h2 className="text-sm font-bold mb-2">Special Instructions</h2>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Allergies, preferences..."
                    rows={2}
                    className="w-full rounded-xl neu-input text-sm resize-none"
                  />
                </div>

                {/* Promo Code */}
                <div className="neu-card-static p-5">
                  <h2 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" /> Promo Code
                  </h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code (try SWIFT10)"
                      className="flex-1 rounded-xl neu-input text-sm"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-4 py-2 rounded-xl neu-btn text-sm font-medium text-primary"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="neu-card-static p-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes (5%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-[#68D89B]">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t border-[#C8D0E0]">
                    <span>Total</span>
                    <span className="gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("details")}
                  className="w-full py-3.5 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* ──────── STEP 2: DETAILS ──────── */}
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Pickup Slot */}
                <div className="neu-card-static p-5">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Pickup Time
                  </h2>
                  <div className="grid grid-cols-4 gap-2">
                    {PICKUP_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setPickupSlot(slot)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          pickupSlot === slot
                            ? "neu-pressed-sm text-primary font-semibold"
                            : "neu-raised-sm text-foreground"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="neu-card-static p-5">
                  <h2 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Pickup Location
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {outletName} — Main Counter
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("payment")}
                  className="w-full py-3.5 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* ──────── STEP 3: PAYMENT ──────── */}
            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="neu-card-static p-5">
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Payment Method
                  </h2>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                            paymentMethod === method.id
                              ? "neu-pressed-sm border-l-4 border-primary"
                              : "neu-raised-sm"
                          }`}
                        >
                          <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-semibold">{method.label}</p>
                            <p className="text-xs text-muted-foreground">{method.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="neu-card-static p-5 space-y-2">
                  <h2 className="text-sm font-bold mb-2">Order Summary</h2>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{itemCount} items</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-[#68D89B]">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t border-[#C8D0E0]">
                    <span>Total</span>
                    <span className="text-xl gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
                  <Shield className="w-3 h-3" /> Secured by SwiftTray
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                  onClick={processPayment}
                  className="w-full py-4 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>Pay {formatPrice(total)}</>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ──────── STEP 4: CONFIRMATION ──────── */}
            {step === "confirmation" && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-24 h-24 rounded-3xl gradient-success flex items-center justify-center mx-auto shadow-mint-glow"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                <div>
                  <h1 className="text-2xl font-extrabold mb-1">Order Placed! 🎉</h1>
                  <p className="text-muted-foreground">
                    Your order has been confirmed
                  </p>
                </div>

                <div className="neu-card-static p-6">
                  <p className="text-xs text-muted-foreground mb-1">Your Pickup Token</p>
                  <motion.p
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="text-5xl font-extrabold gradient-text tracking-[0.25em]"
                  >
                    {pickupToken}
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Show this at the pickup counter
                  </p>
                </div>

                <div className="neu-card-static p-5 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pickup Time</span>
                    <span className="font-medium">{pickupSlot}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Outlet</span>
                    <span className="font-medium">{outletName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-bold gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={orderId ? `/orders/${orderId}` : "/orders"} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl neu-btn-primary text-[#1A2E35] font-semibold"
                    >
                      Track Order
                    </motion.button>
                  </Link>
                  <Link href="/outlets" className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => clearCart()}
                      className="w-full py-3 rounded-xl neu-btn font-semibold text-foreground"
                    >
                      Continue Browsing
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
