"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SignIn } from "@clerk/nextjs";
import { X, GraduationCap } from "lucide-react";

interface StudentAuthFlowProps {
  onClose: () => void;
}

export function StudentAuthFlow({ onClose }: StudentAuthFlowProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Student Portal</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Clerk Sign-In */}
          <SignIn
            fallbackRedirectUrl="/student/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-[#0f1629]/90 backdrop-blur-xl border border-white/10 shadow-2xl !w-full",
                headerTitle: "text-white",
                headerSubtitle: "text-white/60",
                socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                formFieldLabel: "text-white/70",
                formFieldInput: "bg-white/5 border-white/10 text-white",
                footerActionLink: "text-cyan-400 hover:text-cyan-300",
                formButtonPrimary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600",
              },
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
