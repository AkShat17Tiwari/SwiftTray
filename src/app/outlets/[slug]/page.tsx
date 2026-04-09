"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Clock, MapPin, Search, ArrowLeft, Plus, Minus, X,
  Heart, Share2, Info, Flame, Leaf,
} from "lucide-react";
import { getOutletBySlug, getMenuItemsByOutlet } from "@/lib/mock-data";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { MenuItem } from "@/types";

function ItemDetailModal({
  item,
  outletId,
  outletName,
  isOpen,
  onClose,
}: {
  item: MenuItem;
  outletId: string;
  outletName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    Record<string, { label: string; price: number }>
  >({});

  const customizationTotal = Object.values(selectedCustomizations).reduce(
    (sum, c) => sum + c.price,
    0
  );
  const itemTotal = (item.price + customizationTotal) * quantity;

  const handleAdd = () => {
    addItem(
      {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity,
        image: item.image,
        customizations: Object.entries(selectedCustomizations).map(
          ([name, { label, price }]) => ({
            name,
            selected: label,
            price,
          })
        ),
      },
      outletId,
      outletName
    );
    onClose();
    setQuantity(1);
    setSelectedCustomizations({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 bottom-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[85vh] z-[60] bg-background rounded-3xl overflow-hidden flex flex-col border border-border shadow-2xl"
          >
            {/* Image */}
            <div className="relative h-52 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              {item.tags.includes("Bestseller") && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full gradient-warm text-white text-[10px] font-bold uppercase">
                  🔥 Bestseller
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <span className="text-xl font-extrabold gradient-text flex-shrink-0">
                    {formatPrice(item.price)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">
                  <Clock className="w-3 h-3" /> {item.prepTime} min
                </span>
                {item.nutrition?.calories && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">
                    <Flame className="w-3 h-3" /> {item.nutrition.calories} cal
                  </span>
                )}
                {item.tags.includes("Veg") && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                    <Leaf className="w-3 h-3" /> Veg
                  </span>
                )}
              </div>

              {/* Nutrition */}
              {item.nutrition && (
                <div className="glass-card p-3">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Nutrition Info
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Calories", value: item.nutrition.calories },
                      { label: "Protein", value: item.nutrition.protein },
                      { label: "Carbs", value: item.nutrition.carbs },
                      { label: "Fat", value: item.nutrition.fat },
                    ].map(
                      (n) =>
                        n.value && (
                          <div key={n.label} className="text-center">
                            <p className="text-xs font-bold">{n.value}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {n.label}
                            </p>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Customizations */}
              {item.customizations.map((cust) => (
                <div key={cust.name}>
                  <p className="text-sm font-semibold mb-2">
                    {cust.name}
                    {cust.required && (
                      <span className="text-xs text-primary ml-1">
                        (Required)
                      </span>
                    )}
                  </p>
                  <div className="space-y-1.5">
                    {cust.options.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() =>
                          setSelectedCustomizations((prev) => ({
                            ...prev,
                            [cust.name]: { label: opt.label, price: opt.price },
                          }))
                        }
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                          selectedCustomizations[cust.name]?.label === opt.label
                            ? "bg-primary/10 border border-primary/30 text-primary font-medium"
                            : "bg-secondary border border-transparent hover:border-border"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {opt.price > 0 && (
                          <span className="text-xs font-medium">
                            +{formatPrice(opt.price)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center gap-3 bg-secondary rounded-xl px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold w-5 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold shadow-colored flex items-center justify-center gap-2"
              >
                Add to Cart • {formatPrice(itemTotal)}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function OutletDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const outlet = getOutletBySlug(slug);
  const menuItems = outlet ? getMenuItemsByOutlet(outlet._id) : [];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { addItem } = useCart();

  if (!outlet) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Outlet not found</h1>
            <Link href="/outlets" className="text-primary">
              Back to outlets
            </Link>
          </div>
        </main>
      </>
    );
  }

  const categories = [
    "all",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  const filtered = menuItems
    .filter(
      (item) =>
        (selectedCategory === "all" || item.category === selectedCategory) &&
        (searchQuery === "" ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 pb-20 md:pb-8">
        {/* Cover Image */}
        <div className="relative h-56 md:h-72">
          <Image
            src={outlet.coverImage}
            alt={outlet.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

          <div className="absolute top-20 left-4">
            <Link
              href="/outlets"
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          {/* Outlet Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary/20">
                  <Image
                    src={outlet.image}
                    alt={outlet.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold">{outlet.name}</h1>
                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        outlet.isOpen
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {outlet.isOpen ? "OPEN" : "CLOSED"}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {outlet.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <strong className="text-foreground">{outlet.rating}</strong> ({outlet.reviewCount} reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{outlet.avgPrepTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {outlet.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <Heart className="w-4.5 h-4.5" />
                </button>
                <button className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <Share2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search & Categories */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search in ${outlet.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {categories.map((cat) => {
                const catInfo = FOOD_CATEGORIES.find((c) => c.id === cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? "gradient-primary text-white shadow-colored"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {catInfo?.icon} {catInfo?.label || cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {filtered.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card overflow-hidden group cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-sm font-bold bg-red-500/80 px-3 py-1 rounded-full">
                        Unavailable
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-3">
                    <span className="text-lg font-extrabold text-white">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(
                        {
                          menuItemId: item._id,
                          name: item.name,
                          price: item.price,
                          quantity: 1,
                          image: item.image,
                          customizations: [],
                        },
                        outlet._id,
                        outlet.name
                      );
                    }}
                    className="absolute bottom-2 right-3 w-9 h-9 rounded-full gradient-primary text-white flex items-center justify-center shadow-colored opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>

                  {item.tags.includes("Bestseller") && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full gradient-warm text-white text-[9px] font-bold">
                      🔥 BESTSELLER
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-bold truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {item.prepTime}m
                    </span>
                    {item.nutrition?.calories && (
                      <span>{item.nutrition.calories} cal</span>
                    )}
                    {item.tags.includes("Veg") && (
                      <span className="text-emerald-500 flex items-center gap-0.5">
                        <Leaf className="w-3 h-3" /> Veg
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-lg font-semibold mb-1">No items found</h3>
              <p className="text-sm text-muted-foreground">
                Try a different category or search term
              </p>
            </div>
          )}
        </div>

        {/* Item Detail Modal */}
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            outletId={outlet._id}
            outletName={outlet.name}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
