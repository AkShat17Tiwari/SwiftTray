"use client";

import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";

export type AppRole = "student" | "vendor" | "admin" | "super_admin";

export function useAuthRole() {
  const { user, isLoaded, isSignedIn } = useUser();

  return useMemo(() => {
    const role: AppRole =
      (user?.publicMetadata?.role as AppRole) || "student";

    return {
      user,
      userId: user?.id || null,
      role,
      isLoaded,
      isSignedIn: !!isSignedIn,
      isStudent: role === "student",
      isVendor: role === "vendor",
      isAdmin: role === "admin",
      isSuperAdmin: role === "super_admin",
      hasVendorAccess: role === "vendor" || role === "admin" || role === "super_admin",
      hasAdminAccess: role === "admin" || role === "super_admin",
    };
  }, [user, isLoaded, isSignedIn]);
}
