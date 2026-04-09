"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/outlets", icon: Search, label: "Explore" },
  { href: "/checkout", icon: ShoppingBag, label: "Cart" },
  { href: "/orders", icon: ClipboardList, label: "Orders" },
  { href: "/dashboard", icon: User, label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Hide on landing page
  if (pathname === "/") return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.label === "Cart" && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={itemCount}
                    className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full gradient-primary text-white text-[9px] font-bold flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full gradient-primary"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
