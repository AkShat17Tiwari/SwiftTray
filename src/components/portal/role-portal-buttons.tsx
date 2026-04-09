"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useClerk } from "@clerk/nextjs";
import { useAuthRole, type AppRole } from "@/hooks/use-auth-role";
import { toast } from "sonner";
import {
  Users,
  Store,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Portal configuration
   ───────────────────────────────────────────── */
interface PortalConfig {
  key: string;
  label: string;
  desc: string;
  href: string;
  icon: typeof Users;
  gradient: string;
  glowColor: string;
  borderGlow: string;
  bgGlow: string;
  allowedRoles: AppRole[];
  requiresAccessKey: boolean;
}

const PORTALS: PortalConfig[] = [
  {
    key: "student",
    label: "Student",
    desc: "Order & Track",
    href: "/dashboard",
    icon: Users,
    gradient: "from-cyan-500 to-blue-500",
    glowColor: "rgba(34,211,238,0.25)",
    borderGlow: "from-cyan-400 to-blue-500",
    bgGlow: "rgba(34,211,238,0.06)",
    allowedRoles: ["student", "admin", "super_admin"],
    requiresAccessKey: false,
  },
  {
    key: "vendor",
    label: "Vendor",
    desc: "Manage Outlet",
    href: "/vendor",
    icon: Store,
    gradient: "from-orange-500 to-amber-500",
    glowColor: "rgba(249,115,22,0.25)",
    borderGlow: "from-orange-400 to-amber-500",
    bgGlow: "rgba(249,115,22,0.06)",
    allowedRoles: ["vendor", "admin", "super_admin"],
    requiresAccessKey: false,
  },
  {
    key: "admin",
    label: "Admin",
    desc: "Control Center",
    href: "/admin/access",
    icon: Shield,
    gradient: "from-purple-500 to-indigo-500",
    glowColor: "rgba(168,85,247,0.25)",
    borderGlow: "from-purple-400 to-indigo-500",
    bgGlow: "rgba(168,85,247,0.06)",
    allowedRoles: ["admin", "super_admin"],
    requiresAccessKey: true,
  },
];

/* ─────────────────────────────────────────────
   Ripple effect helper
   ───────────────────────────────────────────── */
interface Ripple {
  x: number;
  y: number;
  id: number;
}

/* ─────────────────────────────────────────────
   Single Portal Card
   ───────────────────────────────────────────── */
function PortalCard({ portal }: { portal: PortalConfig }) {
  const router = useRouter();
  const { openSignIn } = useClerk();
  const { isLoaded, isSignedIn, role, hasAdminAccess, hasVendorAccess } = useAuthRole();
  const [isLoading, setIsLoading] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }, []);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      addRipple(e);

      // Wait for Clerk to load
      if (!isLoaded) {
        toast.info("Loading authentication...", { duration: 2000 });
        return;
      }

      // Not signed in → open Clerk sign-in
      if (!isSignedIn) {
        toast.info(`Sign in to access the ${portal.label} Portal`, {
          duration: 3000,
          icon: <portal.icon className="w-4 h-4" />,
        });
        openSignIn({
          fallbackRedirectUrl: portal.href,
        });
        return;
      }

      // Role check
      let hasAccess = false;
      if (portal.key === "student") {
        hasAccess = true; // all authenticated users can access student dashboard
      } else if (portal.key === "vendor") {
        hasAccess = hasVendorAccess;
      } else if (portal.key === "admin") {
        hasAccess = hasAdminAccess;
      }

      if (!hasAccess) {
        toast.error(`Access Denied`, {
          description: `Your role "${role}" doesn't have access to the ${portal.label} Portal.`,
          duration: 4000,
        });
        return;
      }

      // Proceed with navigation
      setIsLoading(true);
      try {
        router.push(portal.href);
      } catch {
        toast.error("Navigation failed. Please try again.");
        setIsLoading(false);
      }
    },
    [isLoaded, isSignedIn, role, hasAdminAccess, hasVendorAccess, portal, router, openSignIn, addRipple]
  );

  const Icon = portal.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.06, y: -6 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Open ${portal.label} Portal`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      className="relative group cursor-pointer select-none overflow-hidden rounded-2xl border border-white/[0.08] backdrop-blur-md p-4 sm:p-5 text-center transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${portal.bgGlow} 0%, rgba(255,255,255,0.02) 100%)`,
        boxShadow: `0 0 0px ${portal.glowColor}`,
      }}
    >
      {/* Hover glow border */}
      <div
        className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${portal.borderGlow} opacity-0 group-hover:opacity-[0.15] transition-opacity duration-300 pointer-events-none`}
      />

      {/* Hover ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 40px ${portal.glowColor}, inset 0 0 30px ${portal.bgGlow}`,
        }}
      />

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            background: portal.glowColor,
            opacity: 0.4,
          }}
        />
      ))}

      {/* Icon */}
      <div className="relative z-10">
        <div
          className={`mx-auto w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-2.5 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
          ) : (
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          )}
        </div>

        <p className="text-sm sm:text-base font-bold text-foreground">{portal.label}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{portal.desc}</p>

        {/* Arrow indicator */}
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mx-auto mt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
      </div>

      {/* Security badge for admin */}
      {portal.requiresAccessKey && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
          <span className="text-[8px] font-semibold text-purple-400">KEY</span>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Role Portal Buttons — Exported Component
   ───────────────────────────────────────────── */
export function RolePortalButtons() {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
      {PORTALS.map((portal) => (
        <PortalCard key={portal.key} portal={portal} />
      ))}
    </div>
  );
}
