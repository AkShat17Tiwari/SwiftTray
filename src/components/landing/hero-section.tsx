"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RolePortalButtons } from "@/components/portal/role-portal-buttons";
import {
  ArrowRight, Play, Zap, Clock, Store, Timer,
  CheckCircle, ChefHat, Bell, MapPin, Star, TrendingUp,
  Users, ShoppingBag,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Stagger helpers
   ───────────────────────────────────────────── */
const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } },
};

/* ─────────────────────────────────────────────
   Animated headline words
   ───────────────────────────────────────────── */
const ROTATING_WORDS = ["Minutes", "Seconds", "No Time"];

/* ─────────────────────────────────────────────
   Benefit chips
   ───────────────────────────────────────────── */
const BENEFITS = [
  { icon: Timer, label: "2 min ordering" },
  { icon: Clock, label: "Live ETA" },
  { icon: Store, label: "15+ outlets" },
  { icon: Zap, label: "No waiting" },
];

/* ─────────────────────────────────────────────
   Trust stats
   ───────────────────────────────────────────── */
const TRUST_STATS = [
  { value: 5000, suffix: "+", label: "Students", icon: Users },
  { value: 15, suffix: "+", label: "Outlets", icon: Store },
  { value: 80, suffix: "%", label: "Less Waiting", icon: TrendingUp },
];

/* ─────────────────────────────────────────────
   Food cards for orbital display
   ───────────────────────────────────────────── */
const FOOD_CARDS = [
  { emoji: "🍔", name: "Classic Burger", price: "₹120" },
  { emoji: "🍕", name: "Margherita", price: "₹180" },
  { emoji: "🍜", name: "Ramen Bowl", price: "₹150" },
  { emoji: "🥤", name: "Berry Shake", price: "₹90" },
  { emoji: "🌮", name: "Loaded Taco", price: "₹110" },
  { emoji: "☕", name: "Cappuccino", price: "₹80" },
];

/* ─────────────────────────────────────────────
   Animated Counter
   ───────────────────────────────────────────── */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${Math.floor(v).toLocaleString()}${suffix}`);
  const [display, setDisplay] = useState(`0${suffix}`);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    const timeout = setTimeout(() => {
      const duration = 2000;
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        motionVal.set(eased * value);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 1500);
    return () => { unsub(); clearTimeout(timeout); };
  }, [value, motionVal, rounded]);

  return <span className="tabular-nums">{display}</span>;
}

/* ─────────────────────────────────────────────
   Phone Mockup — Neumorphic
   ───────────────────────────────────────────── */
function PhoneMockup({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const rotateX = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });

  useEffect(() => {
    rotateX.set(mouseY * 8);
    rotateY.set(mouseX * -8);
  }, [mouseX, mouseY, rotateX, rotateY]);

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1200 }}
      className="relative w-[260px] h-[520px] md:w-[280px] md:h-[560px]"
    >
      {/* Phone Frame — Neumorphic */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-[#E4EBF5] p-[3px] shadow-[12px_12px_24px_rgba(163,177,198,0.7),-12px_-12px_24px_#FFFFFF]">
        <div className="w-full h-full rounded-[2.4rem] bg-[#E4EBF5] overflow-hidden relative shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_#FFFFFF]">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1">
            <span className="text-[#31344B]/50 text-[10px] font-medium">12:42</span>
            <div className="w-20 h-5 rounded-full bg-[#31344B]/10 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.4)]" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm bg-[#31344B]/30" />
              <div className="w-4 h-2 rounded-sm bg-[#31344B]/40" />
            </div>
          </div>

          {/* App Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="px-4 pt-2 pb-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-mint flex items-center justify-center shadow-neu-sm">
                  <ChefHat className="w-3.5 h-3.5 text-[#1A2E35]" />
                </div>
                <span className="text-[#31344B] text-xs font-bold">SwiftTray</span>
              </div>
              <div className="relative">
                <Bell className="w-4 h-4 text-[#31344B]/50" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF8A80]" />
              </div>
            </div>
          </motion.div>

          {/* Order Tracking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mx-3 mt-1 rounded-2xl p-3 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_#FFFFFF]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#68D89B] animate-pulse" />
              <span className="text-[#68D89B] text-[10px] font-semibold">LIVE TRACKING</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[#31344B] text-xs font-bold">Hyderabadi Biryani</p>
                <p className="text-[#7B8BA3] text-[10px]">Spice Junction</p>
              </div>
              <div className="text-right">
                <p className="text-[#5DE5D5] text-xs font-bold tabular-nums">3:42</p>
                <p className="text-[#7B8BA3] text-[10px]">ETA left</p>
              </div>
            </div>
            {/* Progress Steps */}
            <div className="flex items-center gap-1">
              {["Placed", "Preparing", "Ready"].map((step, i) => (
                <div key={step} className="flex-1">
                  <div className={`h-1.5 rounded-full ${i < 2 ? "gradient-mint" : "shadow-[inset_1px_1px_3px_rgba(163,177,198,0.4),inset_-1px_-1px_3px_#FFFFFF]"}`} />
                  <p className={`text-[8px] mt-0.5 font-medium ${i < 2 ? "text-[#5DE5D5]" : "text-[#7B8BA3]"}`}>{step}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Menu Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.5 }}
            className="px-3 pt-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#31344B]/70 text-[10px] font-semibold">Popular Near You</span>
              <span className="text-[#5DE5D5] text-[9px] font-medium">See all</span>
            </div>

            {/* Mini food cards */}
            <div className="space-y-2">
              {[
                { name: "Butter Chicken Thali", price: "₹180", time: "12m", rating: "4.8", emoji: "🍛" },
                { name: "Dragon Noodles", price: "₹120", time: "8m", rating: "4.6", emoji: "🍜" },
                { name: "Cappuccino Grande", price: "₹110", time: "5m", rating: "4.9", emoji: "☕" },
              ].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.2 + i * 0.2, duration: 0.4 }}
                  className="flex items-center gap-2.5 p-2 rounded-xl shadow-[3px_3px_6px_rgba(163,177,198,0.35),-3px_-3px_6px_#FFFFFF]"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#31344B] text-[10px] font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#7B8BA3] text-[9px] flex items-center gap-0.5">
                        <Star className="w-2 h-2 text-[#F5A623] fill-[#F5A623]" />{item.rating}
                      </span>
                      <span className="text-[#7B8BA3] text-[9px]">•</span>
                      <span className="text-[#7B8BA3] text-[9px]">{item.time}</span>
                    </div>
                  </div>
                  <span className="text-[#5DE5D5] text-[10px] font-bold">{item.price}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ready Toast Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -10], scale: [0.9, 1, 1, 0.95] }}
            transition={{ delay: 4, duration: 3.5, repeat: Infinity, repeatDelay: 8, times: [0, 0.1, 0.85, 1] }}
            className="absolute bottom-16 left-3 right-3 rounded-xl gradient-success p-2.5 flex items-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
            <div>
              <p className="text-white text-[10px] font-bold">Order Ready! 🎉</p>
              <p className="text-white/70 text-[9px]">Pick up at Counter 3 — Token ST-B4K9</p>
            </div>
          </motion.div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 inset-x-0 h-14 bg-[#E4EBF5] shadow-[0_-3px_8px_rgba(163,177,198,0.3)] flex items-center justify-around px-4">
            {["🏠", "🔍", "🛒", "📋", "👤"].map((icon, i) => (
              <div key={i} className={`text-sm ${i === 0 ? "opacity-100" : "opacity-40"}`}>
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Floating Food Card (orbits around phone)
   ───────────────────────────────────────────── */
function FloatingFoodCard({ card, index, total }: { card: typeof FOOD_CARDS[0]; index: number; total: number }) {
  const radius = 200;
  const duration = 25 + index * 3;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ ["--orbit-r" as string]: `${radius}px` } as React.CSSProperties}
    >
      <div
        style={{
          animation: `${index % 2 === 0 ? "orbit" : "orbit-reverse"} ${duration}s linear infinite`,
          animationDelay: `${(index * duration) / total * -1}s`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 + index * 0.15, type: "spring", stiffness: 200 }}
          className="neu-card-static p-2.5 flex items-center gap-2 min-w-[110px]"
          style={{ transform: "rotate(0deg)" }}
        >
          <span className="text-2xl">{card.emoji}</span>
          <div>
            <p className="text-[10px] font-bold text-foreground whitespace-nowrap">{card.name}</p>
            <p className="text-[9px] font-semibold text-primary">{card.price}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Live Activity Indicator
   ───────────────────────────────────────────── */
function LiveActivity() {
  const [count, setCount] = useState(23);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full neu-raised-sm"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#68D89B] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#68D89B]" />
      </span>
      <span className="text-xs text-[#68D89B] font-medium tabular-nums">
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
        {" "}students ordering now
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   HERO SECTION — Neumorphic Main Component
   ───────────────────────────────────────────── */
export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#E4EBF5]"
    >
      {/* ── DECORATIVE NEUMORPHIC SHAPES ── */}
      <div className="neu-shape-circle w-[300px] h-[300px] top-[5%] left-[-5%] opacity-40" style={{ animation: "float 12s ease-in-out infinite" }} />
      <div className="neu-shape-circle w-[200px] h-[200px] bottom-[10%] right-[-3%] opacity-30" style={{ animation: "float 10s ease-in-out infinite 2s" }} />
      <div className="neu-shape-pill w-[180px] h-[60px] top-[35%] right-[5%] opacity-20 hidden lg:block" style={{ animation: "float 8s ease-in-out infinite 1s" }} />
      <div className="neu-shape-circle w-[120px] h-[120px] bottom-[25%] left-[8%] opacity-25" style={{ animation: "float 9s ease-in-out infinite 3s" }} />

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 md:pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* ━━━━━━━━ LEFT COLUMN ━━━━━━━━ */}
          <motion.div variants={stagger.container} initial="hidden" animate="show" className="max-w-xl">

            {/* Live Badge */}
            <motion.div variants={stagger.item}>
              <LiveActivity />
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={stagger.item}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight mt-6 leading-[1.1]"
            >
              <span className="block text-foreground">
                Skip the Queue.
              </span>
              <span className="block text-foreground mt-1">
                Grab Your Meal in{" "}
              </span>
              <span className="block mt-1 relative h-[1.2em]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 30, rotateX: -40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -30, rotateX: 40 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute left-0 gradient-text"
                    style={{ display: "inline-block" }}
                  >
                    {ROTATING_WORDS[wordIndex]}.
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={stagger.item}
              className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed max-w-md text-balance"
            >
              Pre-order from your campus canteen, track live preparation,
              and pick up your meal exactly when it&apos;s ready.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/student/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="neon-glow px-7 py-3.5 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold text-base flex items-center gap-2.5 group w-full sm:w-auto justify-center"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  Order Now
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="neon-glow neon-glow-warm px-7 py-3.5 rounded-2xl neu-btn text-foreground font-semibold text-base flex items-center gap-2.5 w-full sm:w-auto justify-center"
              >
                <div className="w-7 h-7 rounded-full gradient-coral flex items-center justify-center">
                  <Play className="w-3 h-3 text-white ml-0.5" />
                </div>
                Watch Demo
              </motion.button>
            </motion.div>

            {/* ── Portal Entry Cards (Auth-Aware) ── */}
            <motion.div variants={stagger.item} className="mt-7">
              <RolePortalButtons />
            </motion.div>

            {/* Benefit Chips */}
            <motion.div variants={stagger.item} className="flex flex-wrap gap-2 mt-8">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1, type: "spring", stiffness: 300 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-pill text-xs font-medium text-foreground/80"
                >
                  <div className="neu-icon-mint w-5 h-5 rounded-full">
                    <b.icon className="w-2.5 h-2.5 text-[#1A2E35]" />
                  </div>
                  {b.label}
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              variants={stagger.item}
              className="flex items-center gap-6 mt-10 pt-8 border-t border-[#C8D0E0]"
            >
              {TRUST_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 + i * 0.15 }}
                  className="text-center sm:text-left"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <stat.icon className="w-3.5 h-3.5 text-primary hidden sm:block" />
                    <p className="text-2xl md:text-3xl font-extrabold gradient-text">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ━━━━━━━━ RIGHT COLUMN — WOW FACTOR ━━━━━━━━ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative flex items-center justify-center min-h-[500px] md:min-h-[600px]"
          >
            {/* Outer neumorphic rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[420px] h-[420px] md:w-[480px] md:h-[480px] rounded-full shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] animate-spin-slow" style={{ animationDuration: "40s" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[340px] h-[340px] md:w-[380px] md:h-[380px] rounded-full shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.7)]" style={{ animation: "spin 60s linear infinite reverse" }} />
            </div>

            {/* Connection labels */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="absolute pointer-events-none"
              style={{ top: "14%", left: "10%" }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full neu-raised-sm text-[9px] font-medium text-muted-foreground">
                <MapPin className="w-2.5 h-2.5 text-[#5DE5D5]" />
                Outlet
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              className="absolute pointer-events-none"
              style={{ top: "48%", right: "5%" }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full neu-raised-sm text-[9px] font-medium text-muted-foreground">
                <ChefHat className="w-2.5 h-2.5 text-[#F5A623]" />
                Kitchen
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4 }}
              className="absolute pointer-events-none"
              style={{ bottom: "10%", right: "8%" }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full neu-raised-sm text-[9px] font-medium text-muted-foreground">
                <CheckCircle className="w-2.5 h-2.5 text-[#68D89B]" />
                Pickup
              </div>
            </motion.div>

            {/* Orbiting Food Cards */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none hidden lg:block">
              {FOOD_CARDS.map((card, i) => (
                <FloatingFoodCard key={card.name} card={card} index={i} total={FOOD_CARDS.length} />
              ))}
            </div>

            {/* Phone Mockup (center) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <PhoneMockup mouseX={mousePos.x} mouseY={mousePos.y} />
            </motion.div>

            {/* Cart slide-in card */}
            <motion.div
              initial={{ opacity: 0, x: 60, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 2.8, type: "spring", stiffness: 150 }}
              className="absolute -right-4 md:right-0 bottom-[25%] neu-card-static p-3 hidden md:flex items-center gap-2.5"
            >
              <div className="neu-icon-mint w-9 h-9 rounded-xl">
                <ShoppingBag className="w-4 h-4 text-[#1A2E35]" />
              </div>
              <div>
                <p className="text-[10px] font-bold">3 items in cart</p>
                <p className="text-[9px] text-primary font-semibold">₹410 total</p>
              </div>
            </motion.div>

            {/* ETA badge */}
            <motion.div
              initial={{ opacity: 0, x: -40, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 2.5, type: "spring", stiffness: 150 }}
              className="absolute -left-4 md:left-0 top-[30%] neu-card-static p-2.5 hidden md:flex items-center gap-2"
            >
              <div className="neu-icon w-8 h-8 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-[#5B9BD5]" />
              </div>
              <div>
                <p className="text-[10px] font-bold">Ready in</p>
                <motion.p
                  className="text-xs text-primary font-bold tabular-nums"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  3:42
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#E4EBF5] to-transparent z-[5]" />
    </section>
  );
}
