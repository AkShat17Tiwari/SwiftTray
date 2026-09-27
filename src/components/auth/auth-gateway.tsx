"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useAuthRole } from "@/hooks/use-auth-role";
import { safeDestination } from "@/lib/navigation";

type Mode = "sign-in" | "sign-up";
type Portal = "student" | "vendor" | "admin";

const PORTAL_DETAILS = {
  student: {
    label: "Student",
    description: "Order food and track pickup",
    icon: GraduationCap,
    href: "/sign-in/student",
    destination: "/student/dashboard",
    iconClass: "neu-icon-mint",
  },
  vendor: {
    label: "Vendor",
    description: "Manage an approved campus outlet",
    icon: Store,
    href: "/sign-in/vendor",
    destination: "/vendor/dashboard",
    iconClass: "gradient-warning",
  },
  admin: {
    label: "Administrator",
    description: "Operate the SwiftTray platform",
    icon: ShieldCheck,
    href: "/sign-in/admin",
    destination: "/admin",
    iconClass: "gradient-coral",
  },
} as const;

function portalFromPath(pathname: string): Portal | null {
  if (pathname.endsWith("/student")) return "student";
  if (pathname.endsWith("/vendor")) return "vendor";
  if (pathname.endsWith("/admin")) return "admin";
  return null;
}

function PortalChooser() {
  return (
    <div className="space-y-5">
      <div>
        <h1 id="auth-title" className="text-2xl font-extrabold">
          Choose your portal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Each role has its own secure sign-in flow.
        </p>
      </div>
      <div className="space-y-3">
        {(Object.entries(PORTAL_DETAILS) as [Portal, (typeof PORTAL_DETAILS)[Portal]][]).map(
          ([key, portal]) => {
            const Icon = portal.icon;
            return (
              <Link
                key={key}
                href={portal.href}
                className="min-h-16 p-3 rounded-2xl neu-btn flex items-center gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${portal.iconClass}`}
                >
                  <Icon className="w-5 h-5 text-[#1A2E35]" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold">{portal.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {portal.description}
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            );
          }
        )}
      </div>
    </div>
  );
}

export function AuthGateway() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const portal = portalFromPath(pathname);
  const auth = useAuthRole();
  const portalStatus = useQuery(
    api.portalAccess.status,
    auth.isSignedIn && auth.isLoaded && portal === "vendor"
      ? {}
      : "skip"
  );
  const verifyPortal = useMutation(api.portalAccess.verify);
  const revokePortal = useMutation(api.portalAccess.revokeCurrent);
  const defaultDestination = portal
    ? PORTAL_DETAILS[portal].destination
    : "/dashboard";
  const destination = safeDestination(
    searchParams.get("next"),
    defaultDestination
  );
  const [mode, setMode] = useState<Mode>(
    portal === "student" && searchParams.get("mode") === "sign-up"
      ? "sign-up"
      : "sign-in"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portalCode, setPortalCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const roleMatchesPortal = useMemo(() => {
    if (!portal || portal === "student") return true;
    if (portal === "vendor") return auth.role === "vendor";
    return ["admin", "super_admin"].includes(auth.role);
  }, [auth.role, portal]);

  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 10) {
      toast.error("Use a password with at least 10 characters.");
      return;
    }
    setPending(true);
    try {
      const callbackURL = portal === "vendor" ? pathname : destination;
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({
              email: email.trim().toLowerCase(),
              password,
              callbackURL,
            })
          : await authClient.signUp.email({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
              callbackURL,
            });
      if (result.error) {
        toast.error(result.error.message || "Authentication failed.");
        return;
      }
      toast.success(mode === "sign-in" ? "Account verified" : "Account created");
      if (portal !== "vendor") {
        router.replace(destination);
      } else {
        router.replace(`${pathname}?next=${encodeURIComponent(destination)}`);
      }
      router.refresh();
    } catch {
      toast.error("Could not connect to authentication. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const submitPortalCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (portal !== "vendor") return;
    if (!/^\d{6}$/.test(portalCode)) {
      toast.error("Enter the complete six-digit login code.");
      return;
    }
    setPending(true);
    try {
      await verifyPortal({ portal: "vendor", code: portalCode });
      toast.success("Vendor portal unlocked");
      router.replace(destination);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The portal code could not be verified."
      );
      setPortalCode("");
    } finally {
      setPending(false);
    }
  };

  const signOut = async () => {
    setPending(true);
    if (auth.isSignedIn) {
      await revokePortal({}).catch(() => undefined);
    }
    await authClient.signOut();
    router.replace(portal ? PORTAL_DETAILS[portal].href : "/");
    router.refresh();
    setPending(false);
  };

  const details = portal ? PORTAL_DETAILS[portal] : null;
  const PortalIcon = details?.icon ?? KeyRound;
  const showCodeStep =
    portal === "vendor" &&
    auth.isLoaded &&
    auth.isSignedIn &&
    roleMatchesPortal;
  const showReadyStep =
    portal !== null &&
    portal !== "vendor" &&
    auth.isLoaded &&
    auth.isSignedIn &&
    roleMatchesPortal;

  return (
    <main className="min-h-dvh bg-background flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="neu-shape-circle w-[420px] h-[420px] -top-24 -left-24 opacity-30" />
        <div className="neu-shape-circle w-[320px] h-[320px] -bottom-20 -right-20 opacity-20" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md neu-card-static p-6 sm:p-8"
        aria-labelledby="auth-title"
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="neu-icon-mint w-12 h-12 rounded-2xl">
            <ChefHat className="w-6 h-6 text-[#1A2E35]" />
          </div>
          <div>
            <p className="text-xl font-extrabold">
              Swift<span className="gradient-text">Tray</span>
            </p>
            <p className="text-xs text-muted-foreground">Secure campus ordering</p>
          </div>
        </div>

        {portal === null ? (
          <PortalChooser />
        ) : !auth.isLoaded ? (
          <div className="min-h-48 flex items-center justify-center" aria-live="polite">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="sr-only">Checking your account</span>
          </div>
        ) : auth.isSignedIn && !roleMatchesPortal ? (
          <div className="space-y-5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${details?.iconClass}`}
            >
              <PortalIcon className="w-6 h-6 text-[#1A2E35]" />
            </div>
            <div>
              <h1 id="auth-title" className="text-2xl font-extrabold">
                Different account required
              </h1>
              <p className="text-sm text-muted-foreground mt-2" role="alert">
                {auth.user?.email} is registered as {auth.role}, not {portal}.
                Sign out and use the correct account.
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              disabled={pending}
              className="w-full min-h-12 rounded-xl neu-btn text-[#E85D75] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Sign out and switch account
            </button>
          </div>
        ) : showReadyStep ? (
          <div className="space-y-5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${details?.iconClass}`}
            >
              <PortalIcon className="w-6 h-6 text-[#1A2E35]" />
            </div>
            <div>
              <h1 id="auth-title" className="text-2xl font-extrabold">
                {details?.label} account ready
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Signed in as {auth.user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.replace(destination)}
              className="w-full min-h-12 rounded-xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2"
            >
              Continue to portal <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={signOut}
              disabled={pending}
              className="w-full min-h-11 rounded-xl neu-btn text-[#E85D75] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        ) : showCodeStep ? (
          <div className="space-y-5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${details?.iconClass}`}
            >
              <PortalIcon className="w-6 h-6 text-[#1A2E35]" />
            </div>
            <div>
              <h1 id="auth-title" className="text-2xl font-extrabold">
                {portalStatus?.active ? `${details?.label} portal ready` : `${details?.label} security check`}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Signed in as {auth.user?.email}
              </p>
            </div>

            {portalStatus?.active ? (
              <button
                type="button"
                onClick={() => router.replace(destination)}
                className="w-full min-h-12 rounded-xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2"
              >
                Continue to portal <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <form onSubmit={submitPortalCode} className="space-y-4">
                <label className="block" htmlFor="portal-code">
                  <span className="text-sm font-semibold">Six-digit login code</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="portal-code"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    autoComplete="one-time-code"
                    value={portalCode}
                    onChange={(event) =>
                      setPortalCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    required
                    autoFocus
                    aria-describedby="portal-code-help"
                    className="w-full min-h-12 pl-10 pr-4 rounded-xl neu-input text-center font-mono text-xl tracking-[0.45em]"
                  />
                </div>
                <p id="portal-code-help" className="text-xs text-muted-foreground">
                  Use the code issued when your outlet access was approved. Five failed attempts cause a 15-minute lock.
                </p>
                <button
                  type="submit"
                  disabled={pending || portalCode.length !== 6 || portalStatus === undefined}
                  className="w-full min-h-12 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {pending ? "Verifying…" : "Unlock portal"}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={signOut}
              disabled={pending}
              className="w-full min-h-11 rounded-xl neu-btn text-[#E85D75] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Choose another portal
            </Link>
            <div className="mb-6">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${details?.iconClass}`}
              >
                <PortalIcon className="w-5 h-5 text-[#1A2E35]" />
              </div>
              <h1 id="auth-title" className="text-2xl font-extrabold">
                {mode === "sign-in"
                  ? `${details?.label} sign in`
                  : "Create student account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {portal === "student"
                  ? "Students sign in normally with email and password."
                  : portal === "admin"
                    ? "Only the configured administrator email and password can access this portal."
                    : "First verify your approved vendor account credentials."}
              </p>
            </div>

            {portal === "student" && (
              <div className="grid grid-cols-2 p-1 rounded-xl neu-pressed-sm mb-6" role="tablist">
                {(["sign-in", "sign-up"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={mode === value}
                    onClick={() => setMode(value)}
                    className={`min-h-10 rounded-lg text-sm font-semibold transition-colors ${
                      mode === value
                        ? "bg-white/60 text-foreground shadow-neu-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {value === "sign-in" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={submitCredentials} className="space-y-4">
              {mode === "sign-up" && portal === "student" && (
                <label className="block">
                  <span className="text-sm font-semibold">Full name</span>
                  <span className="relative block mt-2">
                    <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      minLength={2}
                      maxLength={80}
                      required
                      className="w-full min-h-12 pl-10 pr-4 rounded-xl neu-input text-sm"
                    />
                  </span>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-semibold">Email address</span>
                <span className="relative block mt-2">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="w-full min-h-12 pl-10 pr-4 rounded-xl neu-input text-sm"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Password</span>
                <span className="relative block mt-2">
                  <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                    minLength={10}
                    required
                    aria-describedby="password-help"
                    className="w-full min-h-12 pl-10 pr-12 rounded-xl neu-input text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg neu-btn flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </span>
                <span id="password-help" className="block text-xs text-muted-foreground mt-2">
                  Minimum 10 characters.
                </span>
              </label>

              <button
                type="submit"
                disabled={pending}
                className="w-full min-h-12 rounded-2xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {pending
                  ? "Please wait…"
                  : mode === "sign-in"
                    ? "Verify account"
                    : "Create student account"}
              </button>
            </form>

            {portal === "vendor" && (
              <p className="text-center text-xs text-muted-foreground mt-5">
                Need vendor access?{" "}
                <Link
                  href="/sign-in/student?next=%2Fvendor%2Faccess"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in as a student and apply
                </Link>
              </p>
            )}
          </>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Account identity is verified by Better Auth. Vendor portal codes are verified only on the server.
        </p>
      </motion.section>
    </main>
  );
}
