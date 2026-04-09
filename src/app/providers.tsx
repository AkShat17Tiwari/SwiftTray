"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/use-cart";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"
);

function ConvexClerkWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#0f1629",
          colorText: "#e2e8f0",
          colorInputBackground: "#1a1f36",
          colorInputText: "#e2e8f0",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-[#0f1629] border border-white/10 shadow-2xl",
          formButtonPrimary:
            "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600",
          footerActionLink: "text-indigo-400 hover:text-indigo-300",
        },
      }}
    >
      <ConvexClerkWrapper>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                },
              }}
            />
          </CartProvider>
        </ThemeProvider>
      </ConvexClerkWrapper>
    </ClerkProvider>
  );
}
