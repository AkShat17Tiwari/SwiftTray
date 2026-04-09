"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { MOCK_MENU_ITEMS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export default function VendorMenuPage() {
  const [search, setSearch] = useState("");
  const outletItems = MOCK_MENU_ITEMS.filter((i) => i.outletId === "outlet_1");
  const filtered = outletItems.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(outletItems.map((i) => i.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold mb-1">
            Menu <span className="gradient-text">Management</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {outletItems.length} items across {categories.length} categories
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-colored flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        />
      </div>

      {/* Categories */}
      {categories.map((cat) => {
        const items = filtered.filter((i) => i.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              {cat} <span className="text-foreground/40">({items.length})</span>
            </h2>
            <div className="space-y-2">
              {items.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold truncate">{item.name}</h3>
                      {item.tags.includes("bestseller") && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          🔥 Best
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.price)} • {item.prepTime} min prep
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Availability toggle */}
                    <button
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                        item.isAvailable ? "bg-emerald-500" : "bg-muted"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                          item.isAvailable ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </button>
                    <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
