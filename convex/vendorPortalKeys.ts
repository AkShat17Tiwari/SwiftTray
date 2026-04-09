import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a secure 6-character key (A-Z, 0-9)
function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // removed I/O/1/0 for clarity
  let key = "";
  for (let i = 0; i < 6; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export const create = mutation({
  args: {
    outletId: v.id("outlets"),
    vendorUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Revoke any existing active key for this outlet
    const existing = await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: false, rotatedAt: Date.now() });
    }

    const key = generateKey();
    return await ctx.db.insert("vendorPortalKeys", {
      outletId: args.outletId,
      vendorUserId: args.vendorUserId,
      key,
      isActive: true,
    });
  },
});

export const validate = mutation({
  args: {
    key: v.string(),
    vendorUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!record) return { valid: false, outletId: null };

    // Verify this key belongs to the requesting vendor
    if (record.vendorUserId !== args.vendorUserId) {
      return { valid: false, outletId: null };
    }

    // Update last used
    await ctx.db.patch(record._id, { lastUsedAt: Date.now() });

    return { valid: true, outletId: record.outletId };
  },
});

export const rotate = mutation({
  args: {
    outletId: v.id("outlets"),
    vendorUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Revoke old key
    const existing = await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: false, rotatedAt: Date.now() });
    }

    // Generate new
    const key = generateKey();
    await ctx.db.insert("vendorPortalKeys", {
      outletId: args.outletId,
      vendorUserId: args.vendorUserId,
      key,
      isActive: true,
    });

    return key;
  },
});

export const revoke = mutation({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: false });
    }
  },
});

export const getByOutlet = query({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();
  },
});

export const getByVendor = query({
  args: { vendorUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_vendorUserId", (q) => q.eq("vendorUserId", args.vendorUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vendorPortalKeys").collect();
  },
});
