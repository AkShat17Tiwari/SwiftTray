"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export default function AdminAccessPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#E4EBF5] flex items-center justify-center px-4">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md neu-card-static p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-coral flex items-center justify-center shadow-colored">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">Restricted owner access</p>
          </div>
        </div>

        <form action="/api/portal/admin-verify" method="post" className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Email
            </span>
            <div className="relative mt-2">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl neu-input text-sm"
                placeholder="admin@example.com"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Password
            </span>
            <div className="relative mt-2">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 rounded-xl neu-input text-sm"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg neu-btn flex items-center justify-center text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Only the configured owner account can enter this dashboard.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            Enter Admin Dashboard
          </button>
        </form>
      </motion.section>
    </main>
  );
}
