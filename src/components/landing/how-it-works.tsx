"use client";

import { motion } from "framer-motion";
import { Search, ShoppingCart, Clock, CheckCircle } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";

const ICONS = { "search": Search, "shopping-cart": ShoppingCart, "clock": Clock, "check-circle": CheckCircle };

export function HowItWorks() {
  return (
    <section className="section-padding relative">
      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            How <span className="gradient-text">SwiftTray</span> Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Four simple steps to skip the queue and enjoy your meal
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
          {/* Connecting Line (desktop) — neumorphic embossed */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-1 rounded-full shadow-[inset_1px_1px_3px_rgba(163,177,198,0.5),inset_-1px_-1px_3px_#FFFFFF]" />

          {HOW_IT_WORKS.map((step, i) => {
            const Icon = ICONS[step.icon as keyof typeof ICONS];
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                {/* Step Number Circle */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  className="relative w-24 h-24 mx-auto mb-6"
                >
                  <div className="relative w-full h-full rounded-3xl neu-icon-mint shadow-mint-glow">
                    <Icon className="w-10 h-10 text-[#1A2E35]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full neu-raised flex items-center justify-center text-sm font-bold text-primary">
                    {step.step}
                  </div>
                </motion.div>

                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed px-2">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
