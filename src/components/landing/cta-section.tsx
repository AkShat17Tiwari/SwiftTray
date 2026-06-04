"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden neu-card-static"
        >
          {/* Background — neumorphic surface with mint gradient overlay */}
          <div className="absolute inset-0 gradient-mint opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />

          {/* Floating emojis */}
          {["🍕", "🍜", "☕", "🧁"].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-3xl opacity-15 select-none"
              style={{
                left: `${15 + i * 22}%`,
                top: `${20 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              {emoji}
            </motion.span>
          ))}

          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Sparkles className="w-5 h-5 text-[#1A2E35]/70" />
              <span className="text-[#1A2E35]/70 text-sm font-medium">
                Join 15,000+ students
              </span>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A2E35] mb-4">
              Ready to Skip the Queue?
            </h2>
            <p className="text-lg text-[#1A2E35]/60 max-w-xl mx-auto mb-8">
              Start ordering from your favorite campus outlets in seconds.
              No more waiting. No more hassle.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/student/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl bg-[#E4EBF5] text-[#31344B] font-bold text-lg shadow-[6px_6px_14px_rgba(60,160,150,0.3),-6px_-6px_14px_rgba(120,255,240,0.4)] flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl border-2 border-[#1A2E35]/20 text-[#1A2E35] font-semibold text-lg hover:bg-[#1A2E35]/5 transition-colors"
                >
                  Register as Vendor
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
