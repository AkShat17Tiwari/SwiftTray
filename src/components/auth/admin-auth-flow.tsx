"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignIn } from "@clerk/nextjs";
import { X, Shield, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AdminAuthFlowProps {
  onClose: () => void;
}

type Step = "key" | "clerk";

export function AdminAuthFlow({ onClose }: AdminAuthFlowProps) {
  const [step, setStep] = useState<Step>("key");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Lock countdown timer
  useEffect(() => {
    if (!locked || lockTimer <= 0) return;
    const interval = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1) {
          setLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked, lockTimer]);

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      if (locked) return;
      const char = value.slice(-1);
      if (char && !/\d/.test(char)) return; // digits only

      const newDigits = [...digits];
      newDigits[index] = char;
      setDigits(newDigits);
      setError("");

      // Auto-focus next
      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits filled
      if (char && index === 5 && newDigits.every((d) => d !== "")) {
        verifyKey(newDigits.join(""));
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

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasted.length === 6) {
        const newDigits = pasted.split("");
        setDigits(newDigits);
        inputRefs.current[5]?.focus();
        verifyKey(pasted);
      }
    },
    []
  );

  const verifyKey = async (key: string) => {
    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/portal/admin-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Admin key verified!", {
          description: "Proceeding to authentication...",
          icon: <CheckCircle2 className="w-4 h-4" />,
        });
        setTimeout(() => setStep("clerk"), 800);
      } else if (data.locked) {
        setLocked(true);
        setLockTimer(data.remainingSeconds || 300);
        setError("Too many attempts. Portal locked.");
        triggerShake();
      } else {
        setAttemptsLeft(data.attemptsRemaining ?? attemptsLeft - 1);
        setError(data.error || "Invalid key");
        triggerShake();
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Network error. Try again.");
      triggerShake();
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Admin Portal</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {step === "key" ? (
            <div className="bg-[#0f1629]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              {/* Lock Icon */}
              <div className="flex justify-center mb-5">
                <motion.div
                  animate={success ? { scale: [1, 1.2, 1] } : {}}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    success
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                      : "bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30"
                  }`}
                >
                  {success ? (
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  ) : (
                    <Lock className="w-8 h-8 text-purple-400" />
                  )}
                </motion.div>
              </div>

              <h2 className="text-xl font-bold text-white text-center mb-1">
                Admin Security Key
              </h2>
              <p className="text-sm text-white/50 text-center mb-6">
                Enter the 6-digit admin access key
              </p>

              {/* 6-Digit Input */}
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
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={locked || isVerifying || success}
                    className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-white/5 text-white
                      ${error ? "border-red-500/60 focus:border-red-400" : digit ? "border-purple-500/60 focus:border-purple-400" : "border-white/10 focus:border-purple-400"}
                      ${success ? "border-emerald-500/60 bg-emerald-500/10" : ""}
                      ${locked ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  />
                ))}
              </motion.div>

              {/* Error/Status */}
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

              {!locked && !success && (
                <p className="text-center text-xs text-white/30">
                  {attemptsLeft} attempts remaining
                </p>
              )}

              {isVerifying && (
                <div className="flex justify-center mt-3">
                  <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Clerk Sign-In */
            <SignIn
              fallbackRedirectUrl="/admin"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-[#0f1629]/90 backdrop-blur-xl border border-white/10 shadow-2xl !w-full",
                  headerTitle: "text-white",
                  headerSubtitle: "text-white/60",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                  formFieldLabel: "text-white/70",
                  formFieldInput: "bg-white/5 border-white/10 text-white",
                  footerActionLink: "text-purple-400 hover:text-purple-300",
                  formButtonPrimary: "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600",
                },
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
