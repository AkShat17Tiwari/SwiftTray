"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  Zap,
  History,
  Heart,
  Bell,
  ChevronRight,
  Plus,
} from "lucide-react";
import { MOCK_OUTLETS, MOCK_ORDERS, MOCK_NOTIFICATIONS, getTrendingItems, getOutletById } from "@/lib/mock-data";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { formatPrice, getGreeting, getOrderStatusLabel, getOrderStatusColor, formatRelativeTime } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const trending = getTrendingItems(6);
  const activeOrders = MOCK_ORDERS.filter(
    (o) => o.status !== "picked_up" && o.status !== "cancelled"
  );
  const recentOrders = MOCK_ORDERS.slice(0, 3);
  const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => !n.isRead);
  const openOutlets = MOCK_OUTLETS.filter((o) => o.isOpen);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Greeting & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-extrabold">
            {getGreeting()}, <span className="gradient-text">Student</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            What would you like to eat today?
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative w-full md:w-80"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search meals, outlets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </motion.div>
      </div>

      {/* Active Order Banner */}
      {activeOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href={`/orders/${activeOrders[0]._id}`}>
            <div className="glass-card p-4 gradient-border cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Active Order</p>
                    <p className="text-xs text-muted-foreground">
                      {activeOrders[0].outletName} •{" "}
                      {activeOrders[0].items.length} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(
                      activeOrders[0].status
                    )}`}
                  >
                    {getOrderStatusLabel(activeOrders[0].status)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Category Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto hide-scrollbar pb-1"
      >
        {FOOD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? "gradient-primary text-white shadow-colored"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Notifications */}
      {unreadNotifs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-l-primary">
            <Bell className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {unreadNotifs[0].title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {unreadNotifs[0].message}
              </p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatRelativeTime(unreadNotifs[0]._creationTime)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Nearby Outlets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Nearby Outlets
          </h2>
          <Link
            href="/outlets"
            className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {openOutlets.slice(0, 4).map((outlet, i) => (
            <motion.div
              key={outlet._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link href={`/outlets/${outlet.slug}`}>
                <div className="glass-card overflow-hidden group cursor-pointer">
                  <div className="relative h-28 overflow-hidden">
                    <Image
                      src={outlet.image}
                      alt={outlet.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {outlet.rating}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                      {outlet.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {outlet.avgPrepTime} min
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Meals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Now
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((item, i) => {
            const outlet = getOutletById(item.outletId);
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card p-3 flex gap-3 group cursor-pointer"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {outlet?.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold gradient-text">
                      {formatPrice(item.price)}
                    </span>
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
                      className="w-7 h-7 rounded-full gradient-primary text-white flex items-center justify-center shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Recent Orders
          </h2>
          <Link
            href="/orders"
            className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link href={`/orders/${order._id}`}>
                <div className="glass-card p-4 flex items-center gap-4 group cursor-pointer">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={order.outletImage}
                      alt={order.outletName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">
                      {order.outletName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {order.items.map((i) => i.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-0.5 ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Favorite Outlets */}
      <section className="pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Your Favorites
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {MOCK_OUTLETS.slice(0, 5).map((outlet, i) => (
            <motion.div
              key={outlet._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex-shrink-0"
            >
              <Link
                href={`/outlets/${outlet.slug}`}
                className="flex flex-col items-center gap-2 w-20"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors">
                  <Image
                    src={outlet.image}
                    alt={outlet.name}
                    fill
                    className="object-cover"
                  />
                  {!outlet.isOpen && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">
                        CLOSED
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-center truncate w-full">
                  {outlet.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
