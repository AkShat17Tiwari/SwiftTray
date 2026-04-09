"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { AccessGate } from "@/components/portal/access-gate";

export default function VendorAccessPage() {
  const router = useRouter();
  const { user } = useUser();

  const handleVerify = async (key: string) => {
    const vendorUserId = user?.id;

    if (!vendorUserId) {
      return { success: false, error: "Not authenticated" };
    }

    // Step 1: Validate key against Convex via a lightweight fetch
    // For now we validate through the API route which sets the session cookie
    // In production, this would call Convex first, then the cookie API
    const res = await fetch("/api/portal/vendor-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, vendorUserId, outletId: "pending" }),
    });

    const data = await res.json();

    if (data.success) {
      setTimeout(() => {
        router.push("/vendor");
      }, 1200);
      return { success: true };
    }

    return {
      success: false,
      error: data.error,
      locked: data.locked,
      remainingSeconds: data.remainingSeconds,
      attemptsRemaining: data.attemptsRemaining,
    };
  };

  return (
    <AccessGate
      title="Vendor Portal Access"
      subtitle="Enter your outlet's 6-character workspace key"
      portalType="vendor"
      onVerify={handleVerify}
    />
  );
}
