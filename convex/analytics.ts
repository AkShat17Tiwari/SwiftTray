import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireVendorForOutlet } from "./lib/auth";

export const getOutletStats = query({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    await requireVendorForOutlet(ctx, args.outletId);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const paidOrders = orders.filter((order) => order.paymentStatus === "completed");
    const todayOrders = paidOrders.filter((o) => o._creationTime >= todayTimestamp);
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrders: paidOrders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue,
      avgOrderValue: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
    };
  },
});

export const getTopSellingItems = query({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    await requireVendorForOutlet(ctx, args.outletId);
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .collect();

    return items
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);
  },
});
