import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { recordAudit, requireAdmin } from "./lib/auth";

export const validate = query({
  args: {
    code: v.string(),
    orderAmount: v.number(),
    outletId: v.optional(v.id("outlets")),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();

    if (!coupon) return { valid: false, error: "Invalid coupon code" };
    if (!coupon.isActive) return { valid: false, error: "Coupon is no longer active" };
    if (Date.now() > coupon.validUntil) return { valid: false, error: "Coupon has expired" };
    if (coupon.usedCount >= coupon.usageLimit) return { valid: false, error: "Coupon usage limit reached" };
    if (args.orderAmount < coupon.minOrder) return { valid: false, error: `Minimum order amount is ₹${coupon.minOrder}` };
    if (coupon.outletId && args.outletId && coupon.outletId !== args.outletId) {
      return { valid: false, error: "Coupon not valid for this outlet" };
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Math.min(
        Math.round(args.orderAmount * (coupon.discountValue / 100)),
        coupon.maxDiscount
      );
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      discount,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("coupons").order("desc").collect();
  },
});

export const setActive = mutation({
  args: { id: v.id("coupons"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const coupon = await ctx.db.get(args.id);
    if (!coupon) throw new ConvexError("Coupon not found.");
    await ctx.db.patch(args.id, { isActive: args.isActive });
    await recordAudit(ctx, admin, { action: args.isActive ? "activated_coupon" : "deactivated_coupon", targetType: "coupon", targetId: String(args.id), details: coupon.code });
  },
});

export const remove = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const coupon = await ctx.db.get(args.id);
    if (!coupon) throw new ConvexError("Coupon not found.");
    if (coupon.usedCount > 0) {
      throw new ConvexError("Deactivate a used coupon instead of deleting its history.");
    }
    await ctx.db.delete(args.id);
    await recordAudit(ctx, admin, { action: "deleted_coupon", targetType: "coupon", targetId: String(args.id), details: coupon.code });
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("flat")),
    discountValue: v.number(),
    minOrder: v.number(),
    maxDiscount: v.number(),
    validUntil: v.number(),
    usageLimit: v.number(),
    outletId: v.optional(v.id("outlets")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const code = args.code.trim().toUpperCase();
    if (
      !/^[A-Z0-9_-]{3,24}$/.test(code) ||
      args.discountValue <= 0 ||
      args.minOrder < 0 ||
      args.maxDiscount < 0 ||
      args.usageLimit < 1 ||
      args.validUntil <= Date.now()
    ) {
      throw new ConvexError("Enter valid coupon details.");
    }
    if (args.discountType === "percentage" && args.discountValue > 100) {
      throw new ConvexError("Percentage discount cannot exceed 100%.");
    }
    const existing = await ctx.db.query("coupons").withIndex("by_code", (q) => q.eq("code", code)).unique();
    if (existing) throw new ConvexError("A coupon with this code already exists.");
    const id = await ctx.db.insert("coupons", {
      ...args,
      code,
      usedCount: 0,
      isActive: true,
    });
    await recordAudit(ctx, admin, { action: "created_coupon", targetType: "coupon", targetId: String(id), details: code });
    return id;
  },
});
