"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft, ChevronRight, LogOut, UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuthRole } from "@/hooks/use-auth-role";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  accentColor?: string;
}

export function DashboardSidebar({ title, subtitle, items, accentColor = "from-[#5DE5D5] to-[#6EC6C8]" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuthRole();
  const revokePortal = useMutation(api.portalAccess.revokeCurrent);

  const signOut = async () => {
    await revokePortal({}).catch(() => undefined);
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="dashboard-sidebar hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-background z-40"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center flex-shrink-0 shadow-neu-sm`}>
            <span className="text-[#1A2E35] text-sm font-bold">S</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-bold text-foreground">{title}</p>
                {subtitle && (
                  <p className="text-[10px] text-muted-foreground">{subtitle}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                    isActive
                      ? "neu-pressed-sm text-primary"
                      : "text-muted-foreground hover:text-foreground hover:shadow-neu-sm"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${accentColor}`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge !== undefined && item.badge > 0 && !collapsed && (
                    <span className="ml-auto w-5 h-5 rounded-full gradient-mint text-[#1A2E35] text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full neu-pressed flex items-center justify-center" aria-hidden="true">
              <UserRound className="w-4 h-4" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  {profile?.name ?? "Account"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3">
            <ThemeToggle compact={collapsed} />
          </div>
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            className="mt-3 w-full min-h-10 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#E85D75] neu-btn"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-xs">Sign out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground neu-btn transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40 w-12">
        <ThemeToggle compact />
      </div>
      <div className="dashboard-mobile-nav lg:hidden fixed bottom-0 inset-x-0 bg-background z-40 px-2 py-1 safe-area-bottom">
        <div className="flex items-center justify-around">
          {items.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive ? "neu-pressed-sm" : ""
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
