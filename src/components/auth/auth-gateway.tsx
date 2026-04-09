"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Store, Shield, LogOut,
  Utensils, Sparkles,
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
    gradient: "from-cyan-500 to-blue-500",
    glowColor: "rgba(34,211,238,0.3)",
    borderGlow: "from-cyan-400 to-blue-500",
    bgGlow: "rgba(34,211,238,0.08)",
  },
  {
    key: "vendor" as const,
    label: "Vendor",
    desc: "Manage your outlet & orders",
    icon: Store,
    gradient: "from-orange-500 to-amber-500",
    glowColor: "rgba(249,115,22,0.3)",
    borderGlow: "from-orange-400 to-amber-500",
    bgGlow: "rgba(249,115,22,0.08)",
  },
  {
    key: "admin" as const,
    label: "Admin",
    desc: "System control & analytics",
    icon: Shield,
    gradient: "from-purple-500 to-indigo-500",
    glowColor: "rgba(168,85,247,0.3)",
    borderGlow: "from-purple-400 to-indigo-500",
    bgGlow: "rgba(168,85,247,0.08)",
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
      // Clear portal cookies
      await fetch("/api/portal/logout", { method: "POST" });
      // Clerk sign out
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050810] via-[#0a0e1a] to-[#0f0520] relative overflow-hidden p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] bg-cyan-500/8 animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[100px] bg-purple-500/8 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] bg-orange-500/5" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Swift<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Tray</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl font-extrabold text-white mb-3"
          >
            Portal Access Gateway
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/40 text-sm sm:text-base max-w-md mx-auto"
          >
            Choose your role to access SwiftTray&apos;s campus food management system
          </motion.p>

          {/* Currently signed in indicator */}
          {isSignedIn && user && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/60">
                Signed in as <span className="text-white font-medium">{user.primaryEmailAddress?.emailAddress}</span>
              </span>
            </motion.div>
          )}
        </div>

        {/* Portal Cards Grid */}
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
                className="relative group overflow-hidden rounded-2xl border border-white/[0.08] backdrop-blur-md p-6 text-center cursor-pointer transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${portal.bgGlow} 0%, rgba(255,255,255,0.02) 100%)`,
                }}
              >
                {/* Hover glow border */}
                <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${portal.borderGlow} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`} />

                {/* Ambient glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: `0 0 50px ${portal.glowColor}, inset 0 0 30px ${portal.bgGlow}` }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className={`mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{portal.label}</h3>
                  <p className="text-xs text-white/40">{portal.desc}</p>

                  {/* Security badge for admin */}
                  {portal.key === "admin" && (
                    <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] font-semibold text-purple-400">KEY REQUIRED</span>
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
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50"
          >
            {isSigningOut ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm font-semibold text-red-400">
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </span>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-[11px] text-white/20 mt-8"
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
