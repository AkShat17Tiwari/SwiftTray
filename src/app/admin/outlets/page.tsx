"use client";

import { motion } from "framer-motion";
import { Store, MapPin, Star, Clock, MoreHorizontal, Power, Edit2, Eye } from "lucide-react";
import { MOCK_OUTLETS } from "@/lib/mock-data";

export default function AdminOutletsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">All <span className="gradient-text">Outlets</span></h1>
          <p className="text-sm text-muted-foreground">{MOCK_OUTLETS.length} outlets registered on platform</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-colored flex items-center gap-2">
          <Store className="w-4 h-4" /> Add Outlet
        </button>
      </motion.div>

      {/* Outlets Table */}
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
          <span className="col-span-4">Outlet</span>
          <span className="col-span-2">Location</span>
          <span className="col-span-1 text-center">Rating</span>
          <span className="col-span-1 text-center">Prep Time</span>
          <span className="col-span-2 text-center">Status</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>
        {MOCK_OUTLETS.map((outlet, i) => (
          <motion.div
            key={outlet._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
          >
            <div className="col-span-4 flex items-center gap-3">
              <img src={outlet.image} alt={outlet.name} className="w-10 h-10 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{outlet.name}</p>
                <p className="text-[10px] text-muted-foreground">{outlet.tags.slice(0, 2).join(", ")}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{outlet.location}</span>
            </div>
            <div className="col-span-1 text-center">
              <span className="flex items-center justify-center gap-1 text-xs">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {outlet.rating}
              </span>
            </div>
            <div className="col-span-1 text-center">
              <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {outlet.avgPrepTime}m
              </span>
            </div>
            <div className="col-span-2 flex justify-center">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                outlet.isOpen
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}>
                {outlet.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1">
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="View">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors" title="Toggle Status">
                <Power className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
