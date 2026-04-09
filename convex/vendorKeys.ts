import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a unique 6-character vendor portal key.
 * Format: uppercase alphanumeric (e.g. A3K91P)
 */
export const generateKey = mutation({
  args: {
    vendorUserId: v.string(),
    outletId: v.optional(v.id("outlets")),
  },
  handler: async (ctx, args) => {
    const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
    let key = "";
    let attempts = 0;

    // Generate unique key with collision check
    while (attempts < 10) {
      key = "";
      for (let i = 0; i < 6; i++) {
        key += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      // Check uniqueness
      const existing = await ctx.db
        .query("vendorPortalKeys")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (!existing) break;
      attempts++;
    }

    if (attempts >= 10) {
      throw new Error("Failed to generate unique key");
    }

    // Check if vendor already has an active key
    const existingVendorKey = await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_vendorUserId", (q) => q.eq("vendorUserId", args.vendorUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingVendorKey) {
      // Return existing key instead of creating duplicate
      return { key: existingVendorKey.key, alreadyExists: true };
    }

    // Insert new key
    await ctx.db.insert("vendorPortalKeys", {
      vendorUserId: args.vendorUserId,
      outletId: args.outletId || ("placeholder" as any),
      key,
      isActive: true,
      lastUsedAt: Date.now(),
    });

    return { key, alreadyExists: false };
  },
});

/**
 * Validate a vendor key against the database.
 */
export const validateKey = mutation({
  args: {
    key: v.string(),
    vendorUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!record) {
      return { valid: false, error: "Invalid vendor key" };
    }

    if (!record.isActive) {
      return { valid: false, error: "This key has been deactivated" };
    }

    // Verify key belongs to this vendor
    if (record.vendorUserId !== args.vendorUserId) {
      return { valid: false, error: "Key does not belong to this account" };
    }

    // Update last used timestamp
    await ctx.db.patch(record._id, { lastUsedAt: Date.now() });

    return {
      valid: true,
      outletId: record.outletId,
    };
  },
});

/**
 * Look up a vendor key by userId (for checking if key exists).
 */
export const getKeyByVendor = query({
  args: { vendorUserId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_vendorUserId", (q) => q.eq("vendorUserId", args.vendorUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    return record ? { key: record.key, outletId: record.outletId } : null;
  },
});
