"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/use-cart";

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
        variables: {
          colorPrimary: "#5DE5D5",
          colorBackground: "#E4EBF5",
          colorText: "#31344B",
          colorInputBackground: "#E4EBF5",
          colorInputText: "#31344B",
          borderRadius: "1rem",
        },
        elements: {
          card: "shadow-[6px_6px_14px_rgba(163,177,198,0.6),-6px_-6px_14px_#FFFFFF] border-none bg-[#E4EBF5]",
          formButtonPrimary:
            "bg-gradient-to-r from-[#5DE5D5] to-[#6EC6C8] text-[#1A2E35] hover:shadow-lg font-bold",
          footerActionLink: "text-[#5DE5D5] hover:text-[#6EC6C8]",
        },
      }}
    >
      <ConvexClerkWrapper>
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#E4EBF5",
                color: "#31344B",
                border: "none",
                boxShadow:
                  "6px 6px 14px rgba(163,177,198,0.6), -6px -6px 14px #FFFFFF",
                borderRadius: "1rem",
              },
            }}
          />
        </CartProvider>
      </ConvexClerkWrapper>
    </ClerkProvider>
  );
}
