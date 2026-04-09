"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  ArrowLeft, ArrowRight, ShoppingBag, Clock, Tag, CreditCard,
  CheckCircle, Minus, Plus, Trash2, Ticket, MapPin, StickyNote,
  Smartphone, Wallet, Building2, PartyPopper,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, calculateTax, getTimeSlots, generatePickupToken } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";

const STEPS = ["Review Order", "Pickup Slot", "Payment", "Confirmed"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, outletName, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [pickupToken, setPickupToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const tax = calculateTax(subtotal);
  const total = subtotal + tax - couponDiscount;
  const timeSlots = getTimeSlots().filter((s) => s.available);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "WELCOME50" && subtotal >= 100) {
      const discount = Math.min(Math.round(subtotal * 0.5), 100);
      setCouponDiscount(discount);
      setCouponApplied(true);
    } else if (couponCode.toUpperCase() === "FLAT30" && subtotal >= 200) {
      setCouponDiscount(30);
      setCouponApplied(true);
    } else {
      setCouponApplied(false);
      setCouponDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise((r) => setTimeout(r, 2000));
    const token = generatePickupToken();
    setPickupToken(token);
    setCurrentStep(3);
    setIsProcessing(false);

    // Confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#8b5cf6", "#a855f7", "#10b981", "#f97316"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.4, x: 0.3 },
      });
    }, 300);
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.4, x: 0.7 },
      });
    }, 500);
  };

  if (items.length === 0 && currentStep !== 3) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Add items from your favorite outlets to get started
            </p>
            <button
              onClick={() => router.push("/outlets")}
              className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold shadow-colored"
            >
              Browse Outlets
            </button>
          </motion.div>
        </main>
        <MobileNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Steps Indicator */}
          {currentStep < 3 && (
            <div className="flex items-center justify-between mb-8">
              {STEPS.slice(0, 3).map((step, i) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i <= currentStep
                        ? "gradient-primary text-white shadow-colored"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`hidden sm:block ml-2 text-xs font-medium ${
                      i <= currentStep ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                  {i < 2 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-2 rounded-full ${
                        i < currentStep ? "gradient-primary" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Review Order */}
            {currentStep === 0 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold">Review Your Order</h2>
                <p className="text-sm text-muted-foreground">
                  From {outletName}
                </p>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="glass-card p-3 flex gap-3"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate">
                          {item.name}
                        </h4>
                        {item.customizations.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {item.customizations.map((c) => c.selected).join(", ")}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-bold">
                            {formatPrice(
                              (item.price +
                                item.customizations.reduce((s, c) => s + c.price, 0)) *
                                item.quantity
                            )}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                updateQuantity(item.menuItemId, item.quantity - 1)
                              }
                              className="w-6 h-6 rounded-full border border-border flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.menuItemId, item.quantity + 1)
                              }
                              className="w-6 h-6 rounded-full gradient-primary text-white flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.menuItemId)}
                              className="ml-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Apply Coupon</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Coupon applied! You save {formatPrice(couponDiscount)}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Try: WELCOME50 or FLAT30
                  </p>
                </div>

                {/* Notes */}
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">
                      Notes for vendor
                    </span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Extra spicy, no onions..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                {/* Price Breakdown */}
                <div className="glass-card p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes (5% GST)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-500">
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(1)}
                  className="w-full py-3.5 rounded-2xl gradient-primary text-white font-semibold shadow-colored flex items-center justify-center gap-2"
                >
                  Continue to Pickup Slot
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Pickup Slot */}
            {currentStep === 1 && (
              <motion.div
                key="pickup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setCurrentStep(0)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <h2 className="text-xl font-bold">Choose Pickup Slot</h2>
                <p className="text-sm text-muted-foreground">
                  When would you like to pick up your order?
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.slice(0, 16).map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedSlot === slot.time
                          ? "gradient-primary text-white shadow-colored"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="glass-card p-4 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">
                        Pickup at {selectedSlot}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estimated ready ~12 minutes after ordering
                      </p>
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3.5 rounded-2xl gradient-primary text-white font-semibold shadow-colored flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 2 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <h2 className="text-xl font-bold">Payment Method</h2>
                <p className="text-sm text-muted-foreground">
                  Choose how you want to pay
                </p>

                <div className="space-y-2">
                  {[
                    { key: "upi", label: "UPI (GPay / PhonePe / Paytm)", icon: Smartphone, desc: "Pay instantly via UPI" },
                    { key: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
                    { key: "wallet", label: "Campus Wallet", icon: Wallet, desc: "₹2,450 balance available" },
                    { key: "counter", label: "Pay at Counter", icon: Building2, desc: "Cash or card at pickup" },
                  ].map(({ key, label, icon: Icon, desc }) => (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                        paymentMethod === key
                          ? "glass-card border-primary/30 !border-primary/30"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          paymentMethod === key
                            ? "gradient-primary text-white"
                            : "bg-background"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div className="ml-auto">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === key
                              ? "border-primary"
                              : "border-muted"
                          }`}
                        >
                          {paymentMethod === key && (
                            <div className="w-2.5 h-2.5 rounded-full gradient-primary" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div className="glass-card p-4 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{outletName}</span>
                    <span>{itemCount} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pickup</span>
                    <span>{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Pay</span>
                    <span className="gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                  className="w-full py-4 rounded-2xl gradient-primary text-white font-bold text-lg shadow-colored flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order • {formatPrice(total)}
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {currentStep === 3 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center space-y-6 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 rounded-full gradient-success mx-auto flex items-center justify-center shadow-xl"
                >
                  <PartyPopper className="w-12 h-12 text-white" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-extrabold mb-1">
                    Order Placed! 🎉
                  </h2>
                  <p className="text-muted-foreground">
                    Your food is being prepared
                  </p>
                </div>

                <div className="glass-card p-6 inline-block mx-auto">
                  <p className="text-xs text-muted-foreground mb-1">
                    Pickup Token
                  </p>
                  <p className="text-4xl font-extrabold gradient-text tracking-wider">
                    {pickupToken}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Show this at the counter
                  </p>
                </div>

                <div className="glass-card p-4 max-w-sm mx-auto space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outlet</span>
                    <span className="font-medium">{outletName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">{itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Time</span>
                    <span className="font-medium">{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Total Paid</span>
                    <span className="gradient-text">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      clearCart();
                      router.push("/orders/order_1");
                    }}
                    className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold shadow-colored flex items-center justify-center gap-2"
                  >
                    Track Order
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      clearCart();
                      router.push("/dashboard");
                    }}
                    className="px-6 py-3 rounded-xl border border-border font-semibold hover:bg-secondary transition-colors"
                  >
                    Back to Home
                  </motion.button>
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
