"use client";

import { motion } from "framer-motion";
import { Search, ShoppingCart, Clock, CheckCircle } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";

const ICONS = { "search": Search, "shopping-cart": ShoppingCart, "clock": Clock, "check-circle": CheckCircle };

export function HowItWorks() {
  return (
    <section className="section-padding relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

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
          {/* Connecting Line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

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
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative w-24 h-24 mx-auto mb-6"
                >
                  <div className="absolute inset-0 rounded-3xl gradient-primary opacity-10 blur-xl" />
                  <div className="relative w-full h-full rounded-3xl gradient-primary flex items-center justify-center shadow-colored">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
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
