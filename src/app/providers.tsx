"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { AuthClient } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/use-cart";
import { authClient } from "@/lib/auth-client";
import { api } from "@convex/_generated/api";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"
);

function ProfileBootstrap() {
  const { isAuthenticated } = useConvexAuth();
  const ensureCurrent = useMutation(api.users.ensureCurrent);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      bootstrapped.current = false;
      return;
    }
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    void ensureCurrent({}).catch(() => {
      bootstrapped.current = false;
    });
  }, [ensureCurrent, isAuthenticated]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient as unknown as AuthClient}
    >
      <ProfileBootstrap />
      <CartProvider>
        {children}
        <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--background)",
                color: "var(--foreground)",
                border: "none",
                boxShadow:
                  "6px 6px 14px var(--neu-shadow-dark), -6px -6px 14px var(--neu-shadow-light)",
                borderRadius: "1rem",
              },
            }}
        />
      </CartProvider>
    </ConvexBetterAuthProvider>
  );
}
