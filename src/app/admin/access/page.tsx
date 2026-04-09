"use client";

import { useRouter } from "next/navigation";
import { AccessGate } from "@/components/portal/access-gate";

export default function AdminAccessPage() {
  const router = useRouter();

  const handleVerify = async (key: string) => {
    const res = await fetch("/api/portal/admin-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    const data = await res.json();

    if (data.success) {
      // Redirect to admin dashboard after short delay for success animation
      setTimeout(() => {
        router.push("/admin");
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
      title="Admin Portal Access"
      subtitle="Enter your 6-character security key to continue"
      portalType="admin"
      onVerify={handleVerify}
    />
  );
}
