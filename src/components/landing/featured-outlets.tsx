"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock, MapPin, ArrowRight } from "lucide-react";
import { MOCK_OUTLETS } from "@/lib/mock-data";

export function FeaturedOutlets() {
  const featured = MOCK_OUTLETS.filter((o) => o.isOpen).slice(0, 4);

  return (
    <section className="section-padding relative">
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
              Campus <span className="gradient-text">Outlets</span>
            </h2>
            <p className="text-muted-foreground">
              Explore food from all your favorite campus spots
            </p>
          </div>
          <Link
            href="/outlets"
            className="hidden md:flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((outlet, i) => (
            <motion.div
              key={outlet._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/outlets/${outlet.slug}`}>
                <div className="glass-card overflow-hidden group cursor-pointer">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={outlet.image}
                      alt={outlet.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-xs font-semibold">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {outlet.rating}
                    </div>

                    {/* Open Badge */}
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Open Now
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {outlet.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {outlet.location.split(",")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {outlet.avgPrepTime} min
                      </span>
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {outlet.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="md:hidden flex justify-center mt-8">
          <Link
            href="/outlets"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            View all outlets <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
