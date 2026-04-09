"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Package, Check, Search } from "lucide-react";
import { MOCK_MENU_ITEMS } from "@/lib/mock-data";

export default function VendorInventoryPage() {
  const [search, setSearch] = useState("");
  const items = MOCK_MENU_ITEMS.filter((i) => i.outletId === "outlet_1");
  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const available = items.filter((i) => i.isAvailable).length;
  const outOfStock = items.filter((i) => !i.isAvailable).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold mb-1">
          Inventory <span className="gradient-text">Control</span>
        </h1>
        <p className="text-sm text-muted-foreground">Track stock availability and manage items</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <Package className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
          <p className="text-xl font-extrabold">{items.length}</p>
          <p className="text-xs text-muted-foreground">Total Items</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Check className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
          <p className="text-xl font-extrabold text-emerald-500">{available}</p>
          <p className="text-xs text-muted-foreground">In Stock</p>
        </div>
        <div className="glass-card p-4 text-center">
          <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-red-400" />
          <p className="text-xl font-extrabold text-red-500">{outOfStock}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Items */}
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted-foreground border-b border-border">
          <span className="col-span-5">Item</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-2">Prep Time</span>
          <span className="col-span-3 text-right">Status</span>
        </div>
        {filtered.map((item, i) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            className="grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center hover:bg-secondary/30 transition-colors border-b border-border/30 last:border-0"
          >
            <div className="col-span-5 flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-medium truncate">{item.name}</span>
            </div>
            <span className="col-span-2 text-xs text-muted-foreground">{item.category}</span>
            <span className="col-span-2 text-xs text-muted-foreground">{item.prepTime} min</span>
            <div className="col-span-3 flex items-center justify-end gap-2">
              <button
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                  item.isAvailable ? "bg-emerald-500" : "bg-muted"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${item.isAvailable ? "right-0.5" : "left-0.5"}`} />
              </button>
              <span className={`text-xs font-medium ${item.isAvailable ? "text-emerald-500" : "text-red-500"}`}>
                {item.isAvailable ? "In Stock" : "Out"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
