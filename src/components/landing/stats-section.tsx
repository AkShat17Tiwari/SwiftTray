"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Building2, Clock, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { api } from "@convex/_generated/api";

export function StatsSection() {
  const outlets = useQuery(api.outlets.list, {});
  const features = [
    { label: "Active outlets", value: outlets === undefined ? "…" : String(outlets.length), icon: Building2 },
    { label: "Menus update live", value: "Live", icon: UtensilsCrossed },
    { label: "Order status tracking", value: "Real-time", icon: Clock },
    { label: "Server-verified payments", value: "Secure", icon: ShieldCheck },
  ];
  return <section className="section-padding relative"><div className="max-w-5xl mx-auto"><div className="grid grid-cols-2 md:grid-cols-4 gap-6">{features.map((feature, index) => <motion.div key={feature.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="neu-card p-6 text-center"><div className="w-12 h-12 rounded-2xl neu-icon-mint mx-auto mb-4"><feature.icon className="w-6 h-6"/></div><p className="text-2xl font-extrabold gradient-text">{feature.value}</p><p className="text-sm text-muted-foreground font-medium mt-1">{feature.label}</p></motion.div>)}</div></div></section>;
}
