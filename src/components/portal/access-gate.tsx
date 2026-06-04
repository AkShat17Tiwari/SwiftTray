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

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
    setTimeout(() => {
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }, 800);
  }, []);

  const submitKey = useCallback(async (key: string) => {
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
  }, [onVerify, triggerShake]);

  const handleChange = useCallback((index: number, value: string) => {
    if (status === "locked" || status === "loading" || status === "success") return;

    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z0-9]$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setStatus("idle");
    setErrorMessage("");

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (char && index === 5 && newDigits.every((d) => d !== "")) {
      submitKey(newDigits.join(""));
    }
  }, [digits, status, submitKey]);

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
  }, [submitKey]);

  const formatCooldown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const accentGradient = portalType === "admin" ? "gradient-coral" : "gradient-mint";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E4EBF5] relative overflow-hidden">
      {/* Neumorphic decorative shapes */}
      <div className="neu-shape-circle w-[300px] h-[300px] top-[10%] left-[-5%] opacity-30" />
      <div className="neu-shape-circle w-[200px] h-[200px] bottom-[15%] right-[-3%] opacity-25" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card — Neumorphic */}
        <div className="neu-card-static p-8">
          {/* Lock icon */}
          <motion.div
            className="flex justify-center mb-6"
            animate={status === "success" ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className={`relative w-16 h-16 rounded-2xl ${accentGradient} flex items-center justify-center shadow-neu-sm`}>
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                    <CheckCircle2 className="w-8 h-8 text-[#1A2E35]" />
                  </motion.div>
                ) : status === "locked" ? (
                  <motion.div key="lock" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <AlertTriangle className="w-8 h-8 text-[#1A2E35]" />
                  </motion.div>
                ) : (
                  <motion.div key="shield" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Shield className="w-8 h-8 text-[#1A2E35]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-extrabold text-foreground mb-1">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Input boxes — Neumorphic embossed */}
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
                    w-12 h-14 text-center text-lg font-bold rounded-xl transition-all duration-200 
                    outline-none text-foreground
                    ${status === "error" ? "shadow-[inset_3px_3px_7px_rgba(232,93,117,0.2),inset_-3px_-3px_7px_#FFFFFF] bg-[#E85D75]/5" : ""}
                    ${status === "success" ? "shadow-[inset_3px_3px_7px_rgba(104,216,155,0.2),inset_-3px_-3px_7px_#FFFFFF] bg-[#68D89B]/5" : ""}
                    ${status === "locked" ? "neu-pressed-sm opacity-50" : ""}
                    ${!digit && status !== "error" && status !== "success" && status !== "locked" ? "neu-pressed-sm" : ""}
                    ${digit && status !== "error" && status !== "success" ? "shadow-[inset_3px_3px_7px_rgba(163,177,198,0.35),inset_-3px_-3px_7px_#FFFFFF,0_0_0_2px_rgba(93,229,213,0.3)]" : ""}
                    disabled:cursor-not-allowed
                  `}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Status messages */}
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying access key...</span>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-4">
                <p className="text-[#E85D75] text-sm font-medium">{errorMessage}</p>
                {attemptsLeft < 5 && (
                  <p className="text-[#E85D75]/60 text-xs mt-1">{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining</p>
                )}
              </motion.div>
            )}

            {status === "locked" && (
              <motion.div key="locked" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 text-[#F5A623]">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Access Temporarily Locked</span>
                </div>
                <p className="text-[#F5A623]/60 text-xs mt-1">Try again in {formatCooldown(cooldownSeconds)}</p>
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
                  className="mx-auto w-full py-3 rounded-xl gradient-success text-[#1A2E35] font-bold text-sm"
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
          <div className="mt-4 pt-4" style={{ borderTop: "none", boxShadow: "inset 0 1px 2px rgba(163,177,198,0.3), inset 0 -1px 2px #FFFFFF" }}>
            <div className="flex items-center justify-center gap-2 text-muted-foreground/40 text-xs">
              <KeyRound className="w-3 h-3" />
              <span>Protected by SwiftTray Security</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
