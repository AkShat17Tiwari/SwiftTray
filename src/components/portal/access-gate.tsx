"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, CheckCircle2, AlertTriangle, Loader2, KeyRound } from "lucide-react";

interface AccessGateProps {
  title: string;
  subtitle: string;
  portalType: "admin" | "vendor";
  onVerify: (key: string) => Promise<{ success: boolean; error?: string; locked?: boolean; remainingSeconds?: number; attemptsRemaining?: number }>;
}

export function AccessGate({ title, subtitle, portalType, onVerify }: AccessGateProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "locked">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const t = setInterval(() => {
      setCooldownSeconds((s) => {
        if (s <= 1) {
          setStatus("idle");
          setErrorMessage("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownSeconds]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    if (status === "locked" || status === "loading" || status === "success") return;

    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z0-9]$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setStatus("idle");
    setErrorMessage("");

    // Auto-focus next
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (char && index === 5 && newDigits.every((d) => d !== "")) {
      submitKey(newDigits.join(""));
    }
  }, [digits, status]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
    if (text.length === 6) {
      const newDigits = text.split("");
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      submitKey(text);
    }
  }, []);

  const submitKey = async (key: string) => {
    setStatus("loading");
    try {
      const result = await onVerify(key);

      if (result.success) {
        setStatus("success");
      } else if (result.locked) {
        setStatus("locked");
        setErrorMessage(result.error || "Too many attempts");
        setCooldownSeconds(result.remainingSeconds || 300);
        triggerShake();
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Invalid access key");
        if (result.attemptsRemaining !== undefined) {
          setAttemptsLeft(result.attemptsRemaining);
        }
        triggerShake();
      }
    } catch {
      setStatus("error");
      setErrorMessage("Connection error. Please try again.");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
    // Clear inputs after error
    setTimeout(() => {
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }, 800);
  };

  const formatCooldown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const gradientColor = portalType === "admin"
    ? "from-red-500 via-orange-500 to-amber-500"
    : "from-indigo-500 via-purple-500 to-pink-500";

  const glowColor = portalType === "admin"
    ? "shadow-[0_0_80px_rgba(239,68,68,0.15)]"
    : "shadow-[0_0_80px_rgba(99,102,241,0.15)]";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] relative overflow-hidden">
      {/* Ambient glowing orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-purple-500/8 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />

      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 w-full max-w-md mx-4`}
      >
        {/* Card */}
        <div className={`relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 ${glowColor}`}>
          {/* Gradient border glow */}
          <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-br ${gradientColor} opacity-[0.08] -z-10`} />

          {/* Lock icon */}
          <motion.div
            className="flex justify-center mb-6"
            animate={status === "success" ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </motion.div>
                ) : status === "locked" ? (
                  <motion.div key="lock" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </motion.div>
                ) : (
                  <motion.div key="shield" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulse ring */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradientColor}`}
                animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-extrabold text-white mb-1">{title}</h1>
            <p className="text-sm text-white/40">{subtitle}</p>
          </div>

          {/* Input boxes */}
          <motion.div
            className="flex justify-center gap-3 mb-6"
            animate={shake ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {digits.map((digit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.3 }}
              >
                <input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  disabled={status === "locked" || status === "success" || status === "loading"}
                  className={`
                    w-12 h-14 text-center text-lg font-bold rounded-xl border-2 transition-all duration-200
                    bg-white/[0.03] text-white outline-none
                    ${status === "error" ? "border-red-500/60 bg-red-500/5" : ""}
                    ${status === "success" ? "border-emerald-500/60 bg-emerald-500/5" : ""}
                    ${status === "locked" ? "border-amber-500/40 bg-amber-500/5 opacity-50" : ""}
                    ${digit ? "border-white/20" : "border-white/[0.08]"}
                    focus:border-white/30 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(255,255,255,0.05)]
                    disabled:cursor-not-allowed
                  `}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Status messages */}
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 text-white/40 text-sm mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying access key...</span>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-4">
                <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
                {attemptsLeft < 5 && (
                  <p className="text-red-400/60 text-xs mt-1">{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining</p>
                )}
              </motion.div>
            )}

            {status === "locked" && (
              <motion.div key="locked" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Access Temporarily Locked</span>
                </div>
                <p className="text-amber-400/60 text-xs mt-1">Try again in {formatCooldown(cooldownSeconds)}</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-4"
              >
                <motion.div
                  className={`mx-auto w-full py-3 rounded-xl bg-gradient-to-r ${gradientColor} text-white font-bold text-sm`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  ✓ Access Granted — Redirecting...
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="border-t border-white/[0.06] mt-4 pt-4">
            <div className="flex items-center justify-center gap-2 text-white/20 text-xs">
              <KeyRound className="w-3 h-3" />
              <span>Protected by SwiftTray Security</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
