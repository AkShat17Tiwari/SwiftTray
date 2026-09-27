"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { api } from "@convex/_generated/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { MenuItem, Outlet } from "@/types";
import type { Id } from "@convex/_generated/dataModel";

type VendorOutlet = Outlet & { _id: Id<"outlets"> };
type VendorMenuItem = MenuItem & { _id: Id<"menuItems"> };

export default function VendorMenuPage() {
  const [search, setSearch] = useState("");
  const workspace = useQuery(
    api.dashboards.vendorWorkspace,
    {}
  ) as { outlet: VendorOutlet } | null | undefined;
  const outlet = workspace?.outlet ?? null;
  const liveItems = useQuery(
    api.menuItems.listForManagement,
    outlet ? { outletId: outlet._id } : "skip"
  ) as VendorMenuItem[] | undefined;
  const toggleAvailability = useMutation(api.menuItems.toggleAvailability);
  const createItem = useMutation(api.menuItems.create);
  const updateItem = useMutation(api.menuItems.update);
  const removeItem = useMutation(api.menuItems.remove);
  const outletItems = liveItems ?? [];
  const isLoading =
    workspace === undefined || (outlet !== null && liveItems === undefined);
  const filtered = outletItems.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(outletItems.map((i) => i.category))];

  const handleToggle = async (id: Id<"menuItems">) => {
    try {
      await toggleAvailability({ id });
      toast.success("Availability updated");
    } catch {
      toast.error("Could not update item");
    }
  };

  const handleAdd = async () => {
    if (!outlet) return;
    const name = window.prompt("Item name")?.trim();
    if (!name) return;
    const description = window.prompt("Description")?.trim();
    if (!description) return;
    const category = window.prompt("Category", "Main course")?.trim();
    const image = window.prompt("Image URL", outlet.image)?.trim();
    const price = Number(window.prompt("Price in rupees", "100"));
    const prepTime = Number(window.prompt("Preparation time in minutes", "10"));
    if (!category || !image || !Number.isFinite(price) || !Number.isFinite(prepTime)) return;
    try {
      await createItem({ outletId: outlet._id, name, description, category, image, price, prepTime, tags: [] });
      toast.success("Menu item added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add item");
    }
  };

  const handleEdit = async (item: VendorMenuItem) => {
    const name = window.prompt("Item name", item.name)?.trim();
    if (!name) return;
    const price = Number(window.prompt("Price in rupees", String(item.price)));
    if (!Number.isFinite(price)) return;
    try {
      await updateItem({ id: item._id, name, price });
      toast.success("Menu item updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update item");
    }
  };

  const handleRemove = async (item: VendorMenuItem) => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    try {
      await removeItem({ id: item._id });
      toast.success("Menu item deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete item");
    }
  };

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
            {outlet?.name ?? "No outlet selected"} • {outletItems.length} items across {categories.length} categories
          </p>
        </div>
        <button type="button" disabled={!outlet} onClick={handleAdd} className="min-h-11 px-4 rounded-xl gradient-primary text-white text-sm font-semibold shadow-colored flex items-center gap-2 disabled:opacity-50">
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
      {isLoading && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading live menu...
        </div>
      )}

      {!isLoading && !outlet && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Request vendor access before managing your menu.
        </div>
      )}

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
                    {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied URLs from arbitrary hosts */}
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
                      type="button"
                      onClick={() => handleToggle(item._id)}
                      aria-label={`${item.isAvailable ? "Mark" : "Restore"} ${item.name} ${item.isAvailable ? "unavailable" : "available"}`}
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
                    <button type="button" onClick={() => handleEdit(item)} aria-label={`Edit ${item.name}`} className="min-w-10 min-h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => handleRemove(item)} aria-label={`Delete ${item.name}`} className="min-w-10 min-h-10 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center">
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
