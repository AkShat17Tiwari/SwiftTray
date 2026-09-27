import { AuthGateway } from "@/components/auth/auth-gateway";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <AuthGateway />
    </Suspense>
  );
}
