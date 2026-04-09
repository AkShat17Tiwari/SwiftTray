import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const trackEvent = mutation({
  args: {
    type: v.string(),
    outletId: v.optional(v.id("outlets")),
    userId: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analyticsEvents", args);
  },
});

export const getOutletStats = query({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayOrders = orders.filter(
      (o) => o._creationTime >= todayTimestamp
    );
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue,
      avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
    };
  },
});

export const getTopSellingItems = query({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .collect();

    return items
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);
  },
});
