"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Plus, Star, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { getTrendingItems } from "@/lib/mock-data";
import { getOutletById } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

export function TopMealsCarousel() {
  const trending = getTrendingItems(8);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
              Trending <span className="gradient-text">Meals</span>
            </h2>
            <p className="text-muted-foreground">
              Most ordered items across campus this week
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory"
        >
          {trending.map((item, i) => {
            const outlet = getOutletById(item.outletId);
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex-shrink-0 w-[280px] snap-center"
              >
                <div className="glass-card overflow-hidden group">
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Price */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-xl font-extrabold text-white">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    {/* Quick Add */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (outlet) {
                          addItem(
                            {
                              menuItemId: item._id,
                              name: item.name,
                              price: item.price,
                              quantity: 1,
                              image: item.image,
                              customizations: [],
                            },
                            item.outletId,
                            outlet.name
                          );
                        }
                      }}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center shadow-colored opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>

                    {/* Tags */}
                    {item.tags.includes("Bestseller") && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full gradient-warm text-white text-[10px] font-bold uppercase tracking-wide">
                        🔥 Bestseller
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-base mb-0.5 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 truncate">
                      {outlet?.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.prepTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {(4 + Math.random()).toFixed(1)}
                      </span>
                      {item.nutrition?.calories && (
                        <span>{item.nutrition.calories} cal</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
