"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthRole, type AppRole } from "@/hooks/use-auth-role";

export function RoleGuard({
  allowed,
  fallback = "/dashboard",
  children,
}: {
  allowed: readonly AppRole[];
  fallback?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoaded, isSignedIn, role } = useAuthRole();
  const portalStatus = useQuery(
    api.portalAccess.status,
    isSignedIn && isLoaded && role === "vendor"
      ? {}
      : "skip"
  );
  const rolePermitted = isSignedIn && allowed.includes(role);
  const portalLoaded =
    !isSignedIn ||
    role !== "vendor" ||
    portalStatus !== undefined;
  const portalPermitted = role !== "vendor" || portalStatus?.active === true;
  const permitted = rolePermitted && portalPermitted;

  useEffect(() => {
    if (!isLoaded || !portalLoaded || permitted) return;
    const next = encodeURIComponent(window.location.pathname);
    if (!isSignedIn) {
      const login = allowed.some((value) => ["admin", "super_admin"].includes(value))
        ? "/sign-in/admin"
        : allowed.includes("vendor")
          ? "/sign-in/vendor"
          : "/sign-in/student";
      router.replace(`${login}?next=${next}`);
      return;
    }
    if (rolePermitted && !portalPermitted) {
      router.replace(`/sign-in/vendor?next=${next}`);
      return;
    }
    router.replace(fallback);
  }, [allowed, fallback, isLoaded, isSignedIn, permitted, portalLoaded, portalPermitted, role, rolePermitted, router]);

  if (!isLoaded || !portalLoaded || !permitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Checking access…</p>
        </div>
      </main>
    );
  }
  return children;
}
