import { query } from "./_generated/server";
import { v } from "convex/values";

const PLATFORM_COMMISSION_RATE = 0.1;

function isToday(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export const adminOverview = query({
  args: {},
  handler: async (ctx) => {
    const [orders, outlets, users, vendorKeys, assignments] = await Promise.all([
      ctx.db.query("orders").collect(),
      ctx.db.query("outlets").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("vendorPortalKeys").collect(),
      ctx.db.query("vendorAssignments").collect(),
    ]);

    const todaysOrders = orders.filter((order) => isToday(order._creationTime));
    const platformRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const cancelledOrders = orders.filter((order) => order.status === "cancelled");
    const activeStudents = users.filter(
      (user) => user.role === "student" && user.status === "active"
    ).length;

    const outletMetrics = outlets
      .map((outlet) => {
        const outletOrders = orders.filter((order) => order.outletId === outlet._id);
        const sales = outletOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const commissionRate = outlet.commissionRate ?? PLATFORM_COMMISSION_RATE * 100;

        return {
          outletId: outlet._id,
          name: outlet.name,
          location: outlet.location,
          isOpen: outlet.isOpen,
          status: outlet.status,
          rating: outlet.rating,
          orderCount: outletOrders.length,
          sales,
          platformProfit: Math.round((sales * commissionRate) / 100),
          vendorPayout: Math.round(sales - (sales * commissionRate) / 100),
          commissionRate,
          vendorEmail:
            outlet.contactEmail ??
            vendorKeys.find((key) => key.outletId === outlet._id)?.vendorUserId ??
            outlet.vendorId ??
            "Unassigned",
        };
      })
      .sort((a, b) => b.sales - a.sales);

    const vendorDetails = outletMetrics.map((outlet) => ({
      id: outlet.outletId,
      outlet: outlet.name,
      email: outlet.vendorEmail,
      status: outlet.status,
      orders: outlet.orderCount,
      sales: outlet.sales,
      profit: outlet.platformProfit,
      payout: outlet.vendorPayout,
      commissionRate: outlet.commissionRate,
    }));

    return {
      stats: {
        totalOrders: orders.length,
        todaysOrders: todaysOrders.length,
        platformRevenue,
        todaysRevenue,
        platformProfit: Math.round(platformRevenue * PLATFORM_COMMISSION_RATE),
        todaysProfit: Math.round(todaysRevenue * PLATFORM_COMMISSION_RATE),
        activeStudents,
        activeOutlets: outlets.filter((outlet) => outlet.isOpen).length,
        totalVendors: vendorDetails.length,
        avgPrepTime:
          outlets.length > 0
            ? Math.round(
                outlets.reduce((sum, outlet) => sum + outlet.avgPrepTime, 0) /
                  outlets.length
              )
            : 0,
        cancelRate:
          orders.length > 0
            ? Number(((cancelledOrders.length / orders.length) * 100).toFixed(1))
            : 0,
        pendingVendors: assignments.filter((assignment) => assignment.status === "pending")
          .length,
      },
      outletMetrics,
      vendorDetails,
      recentOrders: orders
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, 8),
    };
  },
});

export const vendorWorkspace = query({
  args: { vendorUserId: v.string() },
  handler: async (ctx, args) => {
    const activeKey = await ctx.db
      .query("vendorPortalKeys")
      .withIndex("by_vendorUserId", (q) => q.eq("vendorUserId", args.vendorUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.vendorUserId))
      .unique();

    const assignment = await ctx.db
      .query("vendorAssignments")
      .withIndex("by_userId", (q) => q.eq("userId", args.vendorUserId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .first();

    const outletId = activeKey?.outletId ?? user?.assignedOutletId ?? assignment?.outletId;
    if (!outletId) return null;

    const outlet = await ctx.db.get(outletId);
    if (!outlet) return null;

    const [orders, menuItems] = await Promise.all([
      ctx.db
        .query("orders")
        .withIndex("by_outletId", (q) => q.eq("outletId", outletId))
        .order("desc")
        .collect(),
      ctx.db
        .query("menuItems")
        .withIndex("by_outletId", (q) => q.eq("outletId", outletId))
        .collect(),
    ]);

    const todaysOrders = orders.filter((order) => isToday(order._creationTime));
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const activeOrders = orders.filter(
      (order) => !["picked_up", "cancelled"].includes(order.status)
    );
    const uniqueCustomers = new Set(orders.map((order) => order.userId)).size;
    const avgOrderValue = orders.length > 0 ? Math.round(revenue / orders.length) : 0;

    const topItems = menuItems
      .map((item) => {
        const orderedQuantity = orders.reduce((sum, order) => {
          const quantity = order.items
            .filter((orderItem) => orderItem.menuItemId === item._id)
            .reduce((itemSum, orderItem) => itemSum + orderItem.quantity, 0);
          return sum + quantity;
        }, 0);

        return {
          id: item._id,
          name: item.name,
          orders: orderedQuantity,
          revenue: orderedQuantity * item.price,
        };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    return {
      outlet,
      stats: {
        totalOrders: orders.length,
        todaysOrders: todaysOrders.length,
        revenue,
        todaysRevenue,
        activeOrders: activeOrders.length,
        avgPrepTime: outlet.avgPrepTime,
        uniqueCustomers,
        avgOrderValue,
        availableItems: menuItems.filter((item) => item.isAvailable).length,
        totalItems: menuItems.length,
      },
      activeOrders,
      recentOrders: orders.slice(0, 10),
      topItems,
    };
  },
});
