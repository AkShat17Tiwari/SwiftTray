"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import {
  X, Store, Lock, AlertTriangle, CheckCircle2,
  Copy, ArrowLeft, Sparkles, KeyRound,
} from "lucide-react";
import { toast } from "sonner";

interface VendorAuthFlowProps {
  onClose: () => void;
}

type Mode = "choose" | "new-signup" | "new-key-display" | "existing-key" | "existing-clerk";

export function VendorAuthFlow({ onClose }: VendorAuthFlowProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [generatedKey, setGeneratedKey] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { user } = useUser();

  // Lock countdown
  useEffect(() => {
    if (!locked || lockTimer <= 0) return;
    const interval = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1) { setLocked(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked, lockTimer]);

  // Generate key for new vendor after Clerk auth
  const handleGenerateKey = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/portal/vendor-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", vendorUserId: user.id }),
      });
      const data = await res.json();

      if (data.key) {
        setGeneratedKey(data.key);
        setMode("new-key-display");
        toast.success(data.alreadyExists ? "Your existing key was found!" : "Vendor key generated!", {
          icon: <KeyRound className="w-4 h-4" />,
        });
      } else {
        toast.error("Failed to generate vendor key");
      }
    } catch {
      toast.error("Failed to generate vendor key");
    }
  }, [user]);

  // Copy key
  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    toast.success("Key copied to clipboard!");
  };

  // Digit input handlers
  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      if (locked) return;
      const char = value.slice(-1).toUpperCase();
      if (char && !/[A-Z0-9]/.test(char)) return;

      const newDigits = [...digits];
      newDigits[index] = char;
      setDigits(newDigits);
      setError("");

      if (char && index < 5) inputRefs.current[index + 1]?.focus();

      if (char && index === 5 && newDigits.every((d) => d !== "")) {
        verifyExistingKey(newDigits.join(""));
      }
    },
    [digits, locked]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
      verifyExistingKey(pasted);
    }
  }, []);

  const verifyExistingKey = async (key: string) => {
    if (!user?.id) {
      setError("Please sign in first");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/portal/vendor-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate", key, vendorUserId: user.id }),
      });
      const data = await res.json();

      if (data.valid) {
        toast.success("Vendor key verified!", {
          description: "Redirecting to dashboard...",
        });
        setTimeout(() => {
          window.location.href = "/vendor/dashboard";
        }, 1000);
      } else {
        setAttemptsLeft((prev) => Math.max(0, prev - 1));
        setError(data.error || "Invalid key");
        triggerShake();
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();

        if (attemptsLeft <= 1) {
          setLocked(true);
          setLockTimer(300);
        }
      }
    } catch {
      setError("Verification failed. Try again.");
      triggerShake();
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const renderContent = () => {
    switch (mode) {
      case "choose":
        return (
          <div className="bg-[#0f1629]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                <Store className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-1">Vendor Portal</h2>
            <p className="text-sm text-white/50 text-center mb-6">Choose your access method</p>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("new-signup")}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">New Vendor Signup</p>
                    <p className="text-xs text-white/40">Create account & get workspace key</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("existing-clerk")}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Existing Vendor Login</p>
                    <p className="text-xs text-white/40">Sign in with your workspace key</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        );

      case "new-signup":
        return (
          <div>
            <button
              onClick={() => setMode("choose")}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 mb-3 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <SignUp
              fallbackRedirectUrl="/vendor/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-[#0f1629]/90 backdrop-blur-xl border border-white/10 shadow-2xl !w-full",
                  headerTitle: "text-white",
                  headerSubtitle: "text-white/60",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                  formFieldLabel: "text-white/70",
                  formFieldInput: "bg-white/5 border-white/10 text-white",
                  footerActionLink: "text-orange-400 hover:text-orange-300",
                  formButtonPrimary: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
                },
              }}
            />
            {user && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleGenerateKey}
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Generate My Workspace Key
              </motion.button>
            )}
          </div>
        );

      case "new-key-display":
        return (
          <div className="bg-[#0f1629]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Your Workspace Key</h2>
            <p className="text-sm text-white/50 mb-6">Save this key — you&apos;ll need it to log in</p>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex gap-1.5">
                {generatedKey.split("").map((char, i) => (
                  <div
                    key={i}
                    className="w-11 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/40 flex items-center justify-center"
                  >
                    <span className="text-xl font-bold text-orange-300">{char}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={copyKey}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Copy className="w-4 h-4 text-white" />
              </button>
            </div>

            <p className="text-xs text-amber-400/80 mb-6">
              ⚠️ This key is shown only once. Store it securely.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => (window.location.href = "/vendor/dashboard")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm"
            >
              Go to Vendor Dashboard →
            </motion.button>
          </div>
        );

      case "existing-clerk":
        return (
          <div>
            <button
              onClick={() => setMode("choose")}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 mb-3 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <SignIn
              fallbackRedirectUrl="/sign-in"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-[#0f1629]/90 backdrop-blur-xl border border-white/10 shadow-2xl !w-full",
                  headerTitle: "text-white",
                  headerSubtitle: "text-white/60",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                  formFieldLabel: "text-white/70",
                  formFieldInput: "bg-white/5 border-white/10 text-white",
                  footerActionLink: "text-orange-400 hover:text-orange-300",
                  formButtonPrimary: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
                },
              }}
            />
            {user && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setMode("existing-key")}
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm"
              >
                Enter Workspace Key →
              </motion.button>
            )}
          </div>
        );

      case "existing-key":
        return (
          <div className="bg-[#0f1629]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setMode("existing-clerk")}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 mb-4 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>

            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                <Lock className="w-8 h-8 text-orange-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white text-center mb-1">Workspace Key</h2>
            <p className="text-sm text-white/50 text-center mb-6">Enter your 6-character vendor key</p>

            <motion.div
              animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex gap-2.5 justify-center mb-4"
            >
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  disabled={locked || isVerifying}
                  className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-white/5 text-white uppercase
                    ${error ? "border-red-500/60" : digit ? "border-orange-500/60 focus:border-orange-400" : "border-white/10 focus:border-orange-400"}
                    ${locked ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                />
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 justify-center text-red-400 text-sm mb-3"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {locked && (
              <p className="text-center text-xs text-amber-400 mb-3">
                Locked — retry in {Math.floor(lockTimer / 60)}:{String(lockTimer % 60).padStart(2, "0")}
              </p>
            )}

            {!locked && (
              <p className="text-center text-xs text-white/30">
                {attemptsLeft} attempts remaining
              </p>
            )}

            {isVerifying && (
              <div className="flex justify-center mt-3">
                <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Vendor Portal</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {renderContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
