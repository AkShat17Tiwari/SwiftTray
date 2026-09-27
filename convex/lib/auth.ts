import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

type DatabaseCtx = QueryCtx | MutationCtx;
export type AppRole = Doc<"users">["role"];

function normalizedAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function configuredRole(email: string): AppRole {
  return normalizedAdminEmails().has(email.toLowerCase()) ? "admin" : "student";
}

export async function getOptionalProfile(ctx: DatabaseCtx) {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) return null;

  const profile = await ctx.db
    .query("users")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
    .unique();

  return profile ? { authUser, profile } : null;
}

export async function requireProfile(ctx: DatabaseCtx) {
  const authUser = await authComponent.getAuthUser(ctx);
  const profile = await ctx.db
    .query("users")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
    .unique();

  if (!profile) {
    throw new ConvexError("Your account profile is not ready. Please sign in again.");
  }
  if (profile.status === "suspended") {
    throw new ConvexError("This account is suspended.");
  }

  return { authUser, profile, userId: authUser._id };
}

export async function requireRole(ctx: DatabaseCtx, roles: readonly AppRole[]) {
  const current = await requireProfile(ctx);
  if (!roles.includes(current.profile.role)) {
    throw new ConvexError("You do not have permission to perform this action.");
  }
  requirePrivilegedPortalAccess(current);
  return current;
}

export function requirePrivilegedPortalAccess(
  current: Awaited<ReturnType<typeof requireProfile>>
) {
  if (
    current.profile.role === "vendor" &&
    (current.profile.portalAccessExpiresAt ?? 0) <= Date.now()
  ) {
    throw new ConvexError("Your portal login code is required to continue.");
  }
}

export async function requireAdmin(ctx: DatabaseCtx) {
  return requireRole(ctx, ["admin", "super_admin"]);
}

export async function requireVendorForOutlet(
  ctx: DatabaseCtx,
  outletId: Id<"outlets">
) {
  const current = await requireRole(ctx, ["vendor", "admin", "super_admin"]);
  if (
    !["admin", "super_admin"].includes(current.profile.role) &&
    current.profile.assignedOutletId !== outletId
  ) {
    throw new ConvexError("You are not assigned to this outlet.");
  }
  return current;
}

export async function canManageOrder(ctx: DatabaseCtx, order: Doc<"orders">) {
  const current = await requireRole(ctx, ["vendor", "admin", "super_admin"]);
  if (
    current.profile.role === "vendor" &&
    current.profile.assignedOutletId !== order.outletId
  ) {
    throw new ConvexError("You cannot manage orders for another outlet.");
  }
  return current;
}

export async function recordAudit(
  ctx: MutationCtx,
  actor: Awaited<ReturnType<typeof requireProfile>>,
  input: {
    action: string;
    targetType: string;
    targetId?: string;
    details?: string;
  }
) {
  await ctx.db.insert("auditLogs", {
    userId: actor.userId,
    userName: actor.profile.name,
    action: input.action.slice(0, 100),
    targetType: input.targetType.slice(0, 60),
    targetId: input.targetId?.slice(0, 120),
    details: input.details?.slice(0, 1_000),
  });
}
