"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Eye, EyeOff, Trash2, Info, AlertTriangle, Gift, Wrench } from "lucide-react";

const ANNOUNCEMENTS = [
  { id: "a1", title: "Campus Food Festival — 20% off all outlets!", content: "Celebrate campus food week with exclusive discounts. Valid April 15-20.", type: "promotion" as const, target: "all", active: true, createdAt: "Apr 8, 2024" },
  { id: "a2", title: "Scheduled maintenance — April 12, 2-4 AM", content: "SwiftTray will undergo scheduled maintenance. Orders placed before 2 AM will be fulfilled.", type: "maintenance" as const, target: "all", active: true, createdAt: "Apr 7, 2024" },
  { id: "a3", title: "New outlet: Green Leaf Café now live!", content: "Fresh salads, smoothies, and healthy bowls. Check it out in the Outlets section.", type: "info" as const, target: "student", active: true, createdAt: "Apr 5, 2024" },
  { id: "a4", title: "Vendor payment schedule update", content: "Payouts will now be processed every Monday instead of bi-weekly. Check Settings for details.", type: "warning" as const, target: "vendor", active: false, createdAt: "Apr 1, 2024" },
];

const TYPE_CONFIG = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  promotion: { icon: Gift, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  maintenance: { icon: Wrench, color: "text-purple-500", bg: "bg-purple-500/10" },
};

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Campus <span className="gradient-text">Announcements</span></h1>
          <p className="text-sm text-muted-foreground">Broadcast messages to students and vendors</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-colored flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </motion.div>

      <div className="space-y-3">
        {ANNOUNCEMENTS.map((ann, i) => {
          const config = TYPE_CONFIG[ann.type];
          const TypeIcon = config.icon;
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card p-5 ${!ann.active ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <TypeIcon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold">{ann.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${config.bg} ${config.color}`}>
                      {ann.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-secondary text-muted-foreground">
                      {ann.target === "all" ? "Everyone" : ann.target === "student" ? "Students" : "Vendors"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ann.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{ann.createdAt}</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title={ann.active ? "Deactivate" : "Activate"}>
                    {ann.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
