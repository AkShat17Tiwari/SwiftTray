"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Store, Shield, LogOut,
  ChefHat, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { StudentAuthFlow } from "./student-auth-flow";
import { AdminAuthFlow } from "./admin-auth-flow";
import { VendorAuthFlow } from "./vendor-auth-flow";

type ActiveFlow = null | "student" | "vendor" | "admin";

const PORTALS = [
  {
    key: "student" as const,
    label: "Student",
    desc: "Order food from campus outlets",
    icon: GraduationCap,
    accentBg: "gradient-mint",
    accentColor: "#5DE5D5",
  },
  {
    key: "vendor" as const,
    label: "Vendor",
    desc: "Manage your outlet & orders",
    icon: Store,
    accentBg: "gradient-warning",
    accentColor: "#F5A623",
  },
  {
    key: "admin" as const,
    label: "Admin",
    desc: "System control & analytics",
    icon: Shield,
    accentBg: "gradient-coral",
    accentColor: "#FF8A80",
  },
];

export function AuthGateway() {
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null);
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch("/api/portal/logout", { method: "POST" });
      await signOut();
      toast.success("Signed out successfully", {
        description: "All sessions cleared",
        icon: <LogOut className="w-4 h-4" />,
      });
      router.push("/sign-in");
    } catch {
      toast.error("Sign out failed. Try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E4EBF5] relative overflow-hidden p-4">
      {/* Neumorphic Decorative Shapes */}
      <div className="neu-shape-circle w-[400px] h-[400px] top-[5%] left-[-5%] opacity-30" style={{ animation: "float 12s ease-in-out infinite" }} />
      <div className="neu-shape-circle w-[300px] h-[300px] bottom-[10%] right-[-5%] opacity-25" style={{ animation: "float 10s ease-in-out infinite 2s" }} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 mb-5"
          >
            <div className="neu-icon-mint w-12 h-12 rounded-2xl">
              <ChefHat className="w-6 h-6 text-[#1A2E35]" />
            </div>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              Swift<span className="gradient-text">Tray</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3"
          >
            Portal Access Gateway
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto"
          >
            Choose your role to access SwiftTray&apos;s campus food management system
          </motion.p>

          {isSignedIn && user && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full neu-raised-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#68D89B] animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Signed in as <span className="text-foreground font-medium">{user.primaryEmailAddress?.emailAddress}</span>
              </span>
            </motion.div>
          )}
        </div>

        {/* Portal Cards Grid — Neumorphic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {PORTALS.map((portal, i) => {
            const Icon = portal.icon;
            return (
              <motion.button
                key={portal.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveFlow(portal.key)}
                className="relative group overflow-hidden rounded-2xl p-6 text-center cursor-pointer neu-card"
              >
                {/* Content */}
                <div className="relative z-10">
                  <div className={`mx-auto w-14 h-14 rounded-2xl ${portal.accentBg} flex items-center justify-center mb-4 shadow-neu-sm`}>
                    <Icon className="w-7 h-7 text-[#1A2E35]" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{portal.label}</h3>
                  <p className="text-xs text-muted-foreground">{portal.desc}</p>

                  {portal.key === "admin" && (
                    <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF8A80]/10 shadow-neu-inset-sm">
                      <Sparkles className="w-3 h-3 text-[#FF8A80]" />
                      <span className="text-[10px] font-semibold text-[#FF8A80]">KEY REQUIRED</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Sign Out Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl neu-btn text-[#E85D75] font-semibold text-sm disabled:opacity-50"
          >
            {isSigningOut ? (
              <div className="w-4 h-4 border-2 border-[#E85D75] border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-[11px] text-muted-foreground/40 mt-8"
        >
          SwiftTray — Campus Food Management System • Secured by Clerk
        </motion.p>
      </motion.div>

      {/* Auth Flow Modals */}
      {activeFlow === "student" && <StudentAuthFlow onClose={() => setActiveFlow(null)} />}
      {activeFlow === "admin" && <AdminAuthFlow onClose={() => setActiveFlow(null)} />}
      {activeFlow === "vendor" && <VendorAuthFlow onClose={() => setActiveFlow(null)} />}
    </div>
  );
}
