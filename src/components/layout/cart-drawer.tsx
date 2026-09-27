"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, PartyPopper } from "lucide-react";
import { cartLineKey, useCart } from "@/hooks/use-cart";
import { formatPrice, calculateTax } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Springy count-up price — makes totals feel alive as the cart changes */
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 120, damping: 20 });
  const display = useTransform(spring, (v) => formatPrice(Math.round(v)));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}

const FEAST_GOAL = 299;

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, outletName, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;
  const feastProgress = Math.min(1, subtotal / FEAST_GOAL);
  const feastUnlocked = subtotal >= FEAST_GOAL;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="cart-drawer fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md bg-background flex flex-col"
          >
            {/* Accent strip */}
            <div className="h-1 gradient-mint flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#C8D0E0]">
              <div className="flex items-center gap-3">
                <motion.div
                  key={itemCount}
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4 }}
                  className="neu-icon-mint w-10 h-10 rounded-xl relative"
                >
                  <ShoppingBag className="w-5 h-5 text-[#1A2E35]" />
                  {itemCount > 0 && (
                    <motion.span
                      key={`badge-${itemCount}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF8A80] text-white text-[10px] font-bold flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold">Your Cart</h2>
                  {outletName && (
                    <p className="text-xs text-muted-foreground">
                      from {outletName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full neu-btn flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feast progress meter */}
            {items.length > 0 && (
              <div className="px-4 pt-3 pb-1">
                <div className="neu-pressed-sm rounded-xl px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold flex items-center gap-1">
                      {feastUnlocked ? (
                        <>
                          <PartyPopper className="w-3 h-3 text-[#F5A623]" /> Feast mode unlocked!
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-primary" />
                          {formatPrice(FEAST_GOAL - subtotal)} away from a full feast
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {formatPrice(Math.min(subtotal, FEAST_GOAL))} / {formatPrice(FEAST_GOAL)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full shadow-neu-inset-sm overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: `${feastProgress * 100}%` }}
                      transition={{ type: "spring", stiffness: 90, damping: 20 }}
                      className={`h-full rounded-full relative overflow-hidden ${
                        feastUnlocked ? "gradient-success" : "gradient-mint"
                      }`}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                          animation: "shimmer 2s linear infinite",
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-full neu-pressed flex items-center justify-center"
                  >
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-center">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Explore campus outlets and add your favorite meals!
                  </p>
                  <Link
                    href="/outlets"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full neu-btn-primary text-sm font-bold"
                  >
                    Browse Outlets
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, i) => {
                      const lineTotal =
                        (item.price +
                          item.customizations.reduce((s, c) => s + c.price, 0)) *
                        item.quantity;
                      return (
                        <motion.div
                          key={cartLineKey(item)}
                          layout
                          initial={{ opacity: 0, scale: 0.85, x: 40 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, x: 100 }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 28,
                            delay: i * 0.04,
                          }}
                          whileHover={{ y: -2 }}
                          className="neu-card-static p-3 flex gap-3"
                        >
                          <motion.div
                            whileHover={{ scale: 1.06, rotate: 2 }}
                            className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-neu-sm"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                            <div className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded-tl-lg bg-black/55 text-white text-[9px] font-bold">
                              ×{item.quantity}
                            </div>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold truncate">
                              {item.name}
                            </h4>
                            {item.customizations.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.customizations
                                  .map((c) => c.selected)
                                  .join(", ")}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <motion.span
                                key={lineTotal}
                                initial={{ scale: 1.25, color: "#48C78E" }}
                                animate={{ scale: 1, color: "#31344B" }}
                                transition={{ duration: 0.35 }}
                                className="text-sm font-bold"
                              >
                                {formatPrice(lineTotal)}
                              </motion.span>
                              <div className="neu-stepper">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      cartLineKey(item),
                                      item.quantity - 1
                                    )
                                  }
                                  className="neu-stepper-btn w-7 h-7"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <motion.span
                                  key={item.quantity}
                                  initial={{ scale: 1.4 }}
                                  animate={{ scale: 1 }}
                                  className="text-sm font-semibold w-5 text-center"
                                >
                                  {item.quantity}
                                </motion.span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      cartLineKey(item),
                                      item.quantity + 1
                                    )
                                  }
                                  className="neu-stepper-btn w-7 h-7 gradient-mint text-[#1A2E35]"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(cartLineKey(item))}
                            className="self-start p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Promo hint */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#5DE5D5]/10 shadow-neu-inset-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <p className="text-[11px] text-muted-foreground">
                      Use code <span className="font-bold text-foreground">SWIFT10</span> at checkout for 10% off
                    </p>
                  </motion.div>

                  {/* Clear Cart */}
                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#C8D0E0] p-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                    <AnimatedPrice value={subtotal} className="font-medium" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes (5%)</span>
                    <AnimatedPrice value={tax} className="font-medium" />
                  </div>
                  <div className="flex justify-between text-base font-bold pt-1.5 border-t border-[#C8D0E0]">
                    <span>Total</span>
                    <AnimatedPrice value={total} className="gradient-text" />
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2 relative overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Proceed to Checkout
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </span>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
