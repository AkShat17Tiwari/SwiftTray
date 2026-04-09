import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
  args: {
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    eventType: v.union(
      v.literal("admin_key_success"),
      v.literal("admin_key_failure"),
      v.literal("vendor_key_success"),
      v.literal("vendor_key_failure"),
      v.literal("brute_force_lockout"),
      v.literal("key_rotated"),
      v.literal("key_revoked"),
      v.literal("session_expired")
    ),
    portalType: v.union(v.literal("admin"), v.literal("vendor")),
    outletId: v.optional(v.id("outlets")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("securityEvents", args);
  },
});

export const list = query({
  args: {
    portalType: v.optional(v.union(v.literal("admin"), v.literal("vendor"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.portalType) {
      return await ctx.db
        .query("securityEvents")
        .withIndex("by_portalType", (q) => q.eq("portalType", args.portalType!))
        .order("desc")
        .take(args.limit || 50);
    }
    return await ctx.db
      .query("securityEvents")
      .order("desc")
      .take(args.limit || 50);
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("securityEvents")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});
