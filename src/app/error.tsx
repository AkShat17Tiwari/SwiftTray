"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for logging/monitoring integrations
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl gradient-coral mx-auto mb-6 flex items-center justify-center shadow-neu-sm">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-2">
          An unexpected error occurred. Your cart and orders are safe.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl neu-btn-primary text-[#1A2E35] font-semibold text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl neu-btn font-semibold text-sm"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
