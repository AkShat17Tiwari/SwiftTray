"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, Clock, MapPin, Filter, SlidersHorizontal } from "lucide-react";
import { MOCK_OUTLETS } from "@/lib/mock-data";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";

export default function OutletsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "prepTime" | "name">("rating");

  const filtered = MOCK_OUTLETS
    .filter((o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "prepTime") return a.avgPrepTime - b.avgPrepTime;
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-extrabold mb-2">
              All <span className="gradient-text">Outlets</span>
            </h1>
            <p className="text-muted-foreground">
              Browse {MOCK_OUTLETS.length} campus food outlets
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search outlets by name or cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="h-full px-4 rounded-xl bg-secondary border border-border flex items-center gap-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 glass-card p-2 z-20"
                >
                  {[
                    { key: "rating", label: "Top Rated" },
                    { key: "prepTime", label: "Fastest" },
                    { key: "name", label: "Name A-Z" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortBy(key as typeof sortBy);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === key
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Outlets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((outlet, i) => (
              <motion.div
                key={outlet._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link href={`/outlets/${outlet.slug}`}>
                  <div className="glass-card overflow-hidden group cursor-pointer h-full">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={outlet.coverImage}
                        alt={outlet.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Status */}
                      <div className="absolute top-3 left-3">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            outlet.isOpen
                              ? "bg-emerald-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              outlet.isOpen
                                ? "bg-white animate-pulse"
                                : "bg-white/60"
                            }`}
                          />
                          {outlet.isOpen ? "Open" : "Closed"}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-xs font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {outlet.rating}
                        <span className="text-muted-foreground font-normal">
                          ({outlet.reviewCount})
                        </span>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {outlet.name}
                        </h3>
                        <div className="flex items-center gap-3 text-white/70 text-xs">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {outlet.location.split(",")[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {outlet.avgPrepTime} min
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {outlet.description}
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {outlet.tags.map((tag) => (
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

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No outlets found</h3>
              <p className="text-sm text-muted-foreground">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
