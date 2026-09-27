"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export type AppRole = "student" | "vendor" | "admin" | "super_admin";

export function useAuthRole() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const account = useQuery(
    api.users.current,
    isAuthenticated ? {} : "skip"
  );
  const role: AppRole = account?.profile?.role ?? "student";
  const isLoaded =
    !isLoading &&
    (!isAuthenticated || (account != null && account.profile !== null));

  return {
    user: account?.authUser ?? null,
    profile: account?.profile ?? null,
    userId: account?.authUser?._id ?? null,
    role,
    isLoaded,
    isSignedIn: isAuthenticated,
    isStudent: role === "student",
    isVendor: role === "vendor",
    isAdmin: role === "admin",
    isSuperAdmin: role === "super_admin",
    hasVendorAccess: ["vendor", "admin", "super_admin"].includes(role),
    hasAdminAccess: ["admin", "super_admin"].includes(role),
  };
}
