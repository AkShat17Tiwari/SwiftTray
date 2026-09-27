import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { configuredRole, requireAdmin, requireProfile } from "./lib/auth";
import type { Doc } from "./_generated/dataModel";

const roleValidator = v.union(
  v.literal("student"),
  v.literal("vendor"),
  v.literal("admin"),
  v.literal("super_admin")
);

function withoutSensitivePortalFields(user: Doc<"users">) {
  const {
    vendorLoginCodeHash: _vendorLoginCodeHash,
    portalFailedAttempts: _portalFailedAttempts,
    portalLockedUntil: _portalLockedUntil,
    ...safeUser
  } = user;
  return safeUser;
}

export const ensureCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();
    const configured = configuredRole(authUser.email);

    if (existing) {
      const role =
        configured === "admin"
          ? existing.role === "super_admin"
            ? "super_admin"
            : "admin"
          : ["admin", "super_admin"].includes(existing.role)
            ? "student"
            : existing.role;
      await ctx.db.patch(existing._id, {
        name: authUser.name,
        email: authUser.email.toLowerCase(),
        avatarUrl: authUser.image ?? undefined,
        role,
        ...(role !== existing.role
          ? {
              portalAccessExpiresAt: undefined,
              portalFailedAttempts: 0,
              portalLockedUntil: undefined,
            }
          : {}),
        ...(role !== "vendor"
          ? {
              vendorLoginCodeHash: undefined,
              vendorLoginCodeIssuedAt: undefined,
            }
          : {}),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      authUserId: authUser._id,
      name: authUser.name,
      email: authUser.email.toLowerCase(),
      role: configured,
      status: "active",
      avatarUrl: authUser.image ?? undefined,
      favoriteOutlets: [],
      preferences: {},
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) return null;
    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();
    return {
      authUser,
      profile: profile ? withoutSensitivePortalFields(profile) : null,
    };
  },
});

export const listByRole = query({
  args: { role: roleValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    return users.map(withoutSensitivePortalFields);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return users.map(withoutSensitivePortalFields);
  },
});

export const updateRole = mutation({
  args: { userId: v.id("users"), role: roleValidator },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    if (args.role === "super_admin" && actor.profile.role !== "super_admin") {
      throw new ConvexError("Only a super administrator can grant that role.");
    }
    await ctx.db.patch(args.userId, {
      role: args.role,
      portalAccessExpiresAt: undefined,
      portalFailedAttempts: 0,
      portalLockedUntil: undefined,
      ...(args.role !== "vendor"
        ? {
            vendorLoginCodeHash: undefined,
            vendorLoginCodeIssuedAt: undefined,
          }
        : {}),
    });
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("pending_approval")
    ),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    if (actor.profile._id === args.userId && args.status === "suspended") {
      throw new ConvexError("You cannot suspend your own account.");
    }
    await ctx.db.patch(args.userId, { status: args.status });
  },
});

export const assignOutlet = mutation({
  args: {
    userId: v.id("users"),
    outletId: v.optional(v.id("outlets")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found.");
    if (args.outletId && !(await ctx.db.get(args.outletId))) {
      throw new ConvexError("Outlet not found.");
    }
    await ctx.db.patch(args.userId, {
      assignedOutletId: args.outletId,
      role: args.outletId ? "vendor" : "student",
      portalAccessExpiresAt: undefined,
      portalFailedAttempts: 0,
      portalLockedUntil: undefined,
      ...(!args.outletId
        ? {
            vendorLoginCodeHash: undefined,
            vendorLoginCodeIssuedAt: undefined,
          }
        : {}),
    });
  },
});

export const updateProfile = mutation({
  args: {
    phone: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        dietary: v.optional(v.array(v.string())),
        defaultPickupNotes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const updates: {
      phone?: string;
      preferences?: typeof profile.preferences;
    } = {};
    if (args.phone !== undefined) updates.phone = args.phone.trim().slice(0, 20);
    if (args.preferences !== undefined) updates.preferences = args.preferences;
    await ctx.db.patch(profile._id, updates);
  },
});

export const toggleFavoriteOutlet = mutation({
  args: { outletId: v.string() },
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const favorites = new Set(profile.favoriteOutlets);
    if (favorites.has(args.outletId)) favorites.delete(args.outletId);
    else favorites.add(args.outletId);
    await ctx.db.patch(profile._id, { favoriteOutlets: [...favorites] });
  },
});
