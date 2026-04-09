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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
});

/* ─────────────────────────────────────────────
   Animated headline words
   ───────────────────────────────────────────── */
const ROTATING_WORDS = ["Minutes", "Seconds", "No Time"];

/* ─────────────────────────────────────────────
   Benefit chips
   ───────────────────────────────────────────── */
const BENEFITS = [
  { icon: Timer, label: "2 min ordering", color: "from-orange-500 to-amber-500" },
  { icon: Clock, label: "Live ETA", color: "from-cyan-500 to-blue-500" },
  { icon: Store, label: "15+ outlets", color: "from-purple-500 to-indigo-500" },
  { icon: Zap, label: "No waiting", color: "from-emerald-500 to-teal-500" },
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
  { emoji: "🍔", name: "Classic Burger", price: "₹120", color: "from-orange-400 to-amber-500" },
  { emoji: "🍕", name: "Margherita", price: "₹180", color: "from-red-400 to-orange-500" },
  { emoji: "🍜", name: "Ramen Bowl", price: "₹150", color: "from-amber-400 to-yellow-500" },
  { emoji: "🥤", name: "Berry Shake", price: "₹90", color: "from-pink-400 to-rose-500" },
  { emoji: "🌮", name: "Loaded Taco", price: "₹110", color: "from-green-400 to-emerald-500" },
  { emoji: "☕", name: "Cappuccino", price: "₹80", color: "from-amber-600 to-orange-700" },
];

/* ─────────────────────────────────────────────
   Ambient Fish
   ───────────────────────────────────────────── */
function AmbientFish({ x, y, dir, delay, size }: { x: number; y: number; dir: number; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%`, fontSize: size, ["--dir" as string]: dir }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.25, 0.2, 0.25, 0] }}
      transition={{ duration: 12, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div style={{ animation: `swim ${14 + delay * 2}s ease-in-out infinite ${delay}s`, transform: `scaleX(${dir})` }}>
        🐟
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Ambient Bubble
   ───────────────────────────────────────────── */
function Bubble({ x, size, delay }: { x: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        bottom: "-5%",
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        border: "1px solid rgba(99,102,241,0.06)",
      }}
      animate={{
        y: [0, -900],
        opacity: [0, 0.5, 0.3, 0],
        scale: [0.8, 1.1, 0.9, 0.4],
      }}
      transition={{ duration: 10 + delay * 1.5, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

/* ─────────────────────────────────────────────
   Glowing Background Orb
   ───────────────────────────────────────────── */
function GlowOrb({ className, color, size }: { className: string; color: string; size: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        animation: "morph-blob 12s ease-in-out infinite",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Animated Counter
   ───────────────────────────────────────────── */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${Math.floor(v).toLocaleString()}${suffix}`);
  const [display, setDisplay] = useState(`0${suffix}`);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    // Animate from 0 to value after delay
    const timeout = setTimeout(() => {
      const controls = motionVal.set(0);
      // Simple spring-like tween
      const duration = 2000;
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // EaseOutQuart
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
   Phone Mockup — The WOW Factor
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
      {/* Phone Frame */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-gray-800 to-gray-900 p-[3px] shadow-2xl">
        <div className="w-full h-full rounded-[2.4rem] bg-gradient-to-b from-[#0f1629] to-[#0a0e1a] overflow-hidden relative">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1">
            <span className="text-white/50 text-[10px] font-medium">12:42</span>
            <div className="w-20 h-5 rounded-full bg-black" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded-sm bg-white/40" />
              <div className="w-4 h-2 rounded-sm bg-white/50" />
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
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <ChefHat className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white text-xs font-bold">SwiftTray</span>
              </div>
              <div className="relative">
                <Bell className="w-4 h-4 text-white/60" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500" />
              </div>
            </div>
          </motion.div>

          {/* Order Tracking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mx-3 mt-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 p-3 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-semibold">LIVE TRACKING</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white text-xs font-bold">Hyderabadi Biryani</p>
                <p className="text-white/50 text-[10px]">Spice Junction</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 text-xs font-bold tabular-nums">3:42</p>
                <p className="text-white/40 text-[10px]">ETA left</p>
              </div>
            </div>
            {/* Progress Steps */}
            <div className="flex items-center gap-1">
              {["Placed", "Preparing", "Ready"].map((step, i) => (
                <div key={step} className="flex-1">
                  <div className={`h-1 rounded-full ${i < 2 ? "bg-gradient-to-r from-indigo-400 to-purple-400" : "bg-white/10"}`} />
                  <p className={`text-[8px] mt-0.5 ${i < 2 ? "text-indigo-300" : "text-white/30"}`}>{step}</p>
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
              <span className="text-white/80 text-[10px] font-semibold">Popular Near You</span>
              <span className="text-indigo-400 text-[9px]">See all</span>
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
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[10px] font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40 text-[9px] flex items-center gap-0.5">
                        <Star className="w-2 h-2 text-amber-400 fill-amber-400" />{item.rating}
                      </span>
                      <span className="text-white/30 text-[9px]">•</span>
                      <span className="text-white/40 text-[9px]">{item.time}</span>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">{item.price}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ready Toast Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -10], scale: [0.9, 1, 1, 0.95] }}
            transition={{ delay: 4, duration: 3.5, repeat: Infinity, repeatDelay: 8, times: [0, 0.1, 0.85, 1] }}
            className="absolute bottom-16 left-3 right-3 rounded-xl bg-gradient-to-r from-emerald-500/90 to-teal-500/90 p-2.5 backdrop-blur-sm flex items-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
            <div>
              <p className="text-white text-[10px] font-bold">Order Ready! 🎉</p>
              <p className="text-white/70 text-[9px]">Pick up at Counter 3 — Token ST-B4K9</p>
            </div>
          </motion.div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 inset-x-0 h-14 bg-[#0a0e1a]/90 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-4">
            {["🏠", "🔍", "🛒", "📋", "👤"].map((icon, i) => (
              <div key={i} className={`text-sm ${i === 0 ? "opacity-100" : "opacity-40"}`}>
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phone Glow Effect */}
      <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-b from-indigo-500/10 to-purple-500/10 blur-2xl pointer-events-none" />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Floating Food Card (orbits around phone)
   ───────────────────────────────────────────── */
function FloatingFoodCard({ card, index, total }: { card: typeof FOOD_CARDS[0]; index: number; total: number }) {
  const angle = (360 / total) * index;
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
          className="glass-card p-2.5 flex items-center gap-2 min-w-[110px] shadow-lg"
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
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-xs text-emerald-500 font-medium tabular-nums">
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
   HERO SECTION — Main Component
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
      className="relative min-h-screen flex items-center overflow-hidden grain-overlay hero-grid"
    >
      {/* ── BACKGROUND LAYERS ── */}

      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] dark:opacity-100 opacity-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-secondary/[0.03] dark:opacity-0" />

      {/* Glowing Orbs */}
      <GlowOrb
        className="top-[10%] left-[15%] opacity-30 dark:opacity-40"
        color="radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)"
        size={500}
      />
      <GlowOrb
        className="bottom-[10%] right-[10%] opacity-20 dark:opacity-30"
        color="radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)"
        size={600}
      />
      <GlowOrb
        className="top-[50%] right-[30%] opacity-15 dark:opacity-25"
        color="radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)"
        size={400}
      />
      <GlowOrb
        className="bottom-[30%] left-[5%] opacity-10 dark:opacity-20"
        color="radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)"
        size={350}
      />

      {/* Ambient Fish */}
      <AmbientFish x={5} y={30} dir={1} delay={0} size={20} />
      <AmbientFish x={70} y={60} dir={-1} delay={4} size={16} />
      <AmbientFish x={85} y={20} dir={1} delay={7} size={18} />
      <AmbientFish x={20} y={75} dir={-1} delay={2} size={14} />

      {/* Bubbles */}
      {[15, 35, 55, 72, 88, 8, 48, 65].map((x, i) => (
        <Bubble key={i} x={x} size={20 + i * 8} delay={i * 1.8} />
      ))}

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
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="neon-glow px-7 py-3.5 rounded-2xl gradient-primary text-white font-bold text-base shadow-colored flex items-center gap-2.5 group w-full sm:w-auto justify-center"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  Order Now
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="neon-glow neon-glow-warm px-7 py-3.5 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm text-foreground font-semibold text-base flex items-center gap-2.5 hover:bg-card/50 transition-colors w-full sm:w-auto justify-center"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/40 backdrop-blur-sm border border-border/30 text-xs font-medium text-foreground/80"
                >
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${b.color} flex items-center justify-center`}>
                    <b.icon className="w-2.5 h-2.5 text-white" />
                  </div>
                  {b.label}
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              variants={stagger.item}
              className="flex items-center gap-6 mt-10 pt-8 border-t border-border/30"
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
            {/* Outer glow ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[420px] h-[420px] md:w-[480px] md:h-[480px] rounded-full border border-primary/[0.08] animate-spin-slow" style={{ animationDuration: "40s" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[340px] h-[340px] md:w-[380px] md:h-[380px] rounded-full border border-primary/[0.05]" style={{ animation: "spin 60s linear infinite reverse" }} />
            </div>

            {/* Connection Lines (outlet → kitchen → pickup) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-30" viewBox="0 0 500 600">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.4)" />
                  <stop offset="50%" stopColor="rgba(168,85,247,0.3)" />
                  <stop offset="100%" stopColor="rgba(34,211,238,0.2)" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 100 120 Q 250 200 250 300 Q 250 400 400 480"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 2, duration: 3, ease: "easeInOut" }}
              />
              {/* Animated dot along path */}
              <motion.circle
                r="3"
                fill="#818cf8"
                animate={{
                  cx: [100, 250, 250, 400],
                  cy: [120, 200, 400, 480],
                }}
                transition={{ delay: 3, duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            {/* Connection labels */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="absolute pointer-events-none"
              style={{ top: "14%", left: "10%" }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/60 backdrop-blur-sm border border-border/30 text-[9px] font-medium text-muted-foreground">
                <MapPin className="w-2.5 h-2.5 text-cyan-400" />
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/60 backdrop-blur-sm border border-border/30 text-[9px] font-medium text-muted-foreground">
                <ChefHat className="w-2.5 h-2.5 text-orange-400" />
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/60 backdrop-blur-sm border border-border/30 text-[9px] font-medium text-muted-foreground">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
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
              className="absolute -right-4 md:right-0 bottom-[25%] glass-card p-3 shadow-xl hidden md:flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
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
              className="absolute -left-4 md:left-0 top-[30%] glass-card p-2.5 shadow-xl hidden md:flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold">Ready in</p>
                <motion.p
                  className="text-xs text-cyan-500 font-bold tabular-nums"
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
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-[5]" />
    </section>
  );
}
