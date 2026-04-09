import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

    return { valid: true, discount, coupon };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("coupons")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
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
    return await ctx.db.insert("coupons", {
      ...args,
      code: args.code.toUpperCase(),
      usedCount: 0,
      isActive: true,
    });
  },
});
