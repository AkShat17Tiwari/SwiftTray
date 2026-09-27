"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Menu,
  X,
  Bell,
  ChefHat,
  Shield,
  Store,
  Users,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api } from "@convex/_generated/api";
import { useAuthRole } from "@/hooks/use-auth-role";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const auth = useAuthRole();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const unreadNotifs =
    useQuery(api.notifications.getUnreadCount, auth.isSignedIn ? {} : "skip") ?? 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLandingPage = pathname === "/";

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled || !isLandingPage
            ? "app-header bg-background"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="neu-icon-mint w-9 h-9 rounded-xl"
              >
                <ChefHat className="w-5 h-5 text-[#1A2E35]" />
              </motion.div>
              <span className="text-xl font-bold gradient-text">
                SwiftTray
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-full transition-all",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute inset-0 rounded-full neu-pressed-sm"
                        style={{ zIndex: -1 }}
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
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block w-11">
                <ThemeToggle compact />
              </div>
              {/* Notifications */}
              <Link
                href="/orders"
                className="relative w-9 h-9 rounded-full neu-btn flex items-center justify-center text-muted-foreground hover:text-foreground transition-transform hover:scale-105 active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF8A80] text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {unreadNotifs}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <motion.button
                id="cart-fly-target"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative w-9 h-9 rounded-full neu-btn flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={itemCount}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-mint text-[#1A2E35] text-[10px] font-bold flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Portal Links */}
              <div className="hidden md:flex items-center gap-1.5">
                <Link
                  href="/student/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground neu-pill transition-transform hover:scale-105 active:scale-95"
                >
                  <Users className="w-3.5 h-3.5" />
                  Student
                </Link>
                <Link
                  href={auth.hasVendorAccess ? "/vendor/dashboard" : "/vendor/access"}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground neu-pill transition-transform hover:scale-105 active:scale-95"
                >
                  <Store className="w-3.5 h-3.5" />
                  Vendor
                </Link>
                {auth.hasAdminAccess && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full neu-btn-primary text-sm font-bold shadow-mint-glow transition-transform hover:scale-105 active:scale-95"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-full neu-btn flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="app-mobile-menu md:hidden bg-background"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) {
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              <nav className="px-4 py-3 space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "neu-pressed-sm text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="border-t border-border mt-2 pt-2">
                  <div className="px-4 py-2 sm:hidden">
                    <ThemeToggle />
                  </div>
                  <p className="px-4 py-1 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Portals</p>
                  <Link
                    href="/student/dashboard"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <div className="neu-icon-mint w-7 h-7 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-[#1A2E35]" />
                    </div>
                    Student Portal
                  </Link>
                  <Link
                    href={auth.hasVendorAccess ? "/vendor/dashboard" : "/vendor/access"}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <div className="neu-icon w-7 h-7 rounded-lg">
                      <Store className="w-3.5 h-3.5 text-[#F5A623]" />
                    </div>
                    Vendor Portal
                  </Link>
                  {auth.hasAdminAccess && <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <div className="neu-icon w-7 h-7 rounded-lg">
                      <Shield className="w-3.5 h-3.5 text-[#E85D75]" />
                    </div>
                    Admin Portal
                  </Link>}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
