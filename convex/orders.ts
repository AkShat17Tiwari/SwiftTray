import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const place = mutation({
  args: {
    userId: v.string(),
    outletId: v.id("outlets"),
    outletName: v.string(),
    outletImage: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        customizations: v.array(
          v.object({
            name: v.string(),
            selected: v.string(),
            price: v.number(),
          })
        ),
      })
    ),
    subtotal: v.number(),
    tax: v.number(),
    discount: v.number(),
    totalAmount: v.number(),
    couponCode: v.optional(v.string()),
    pickupSlot: v.string(),
    pickupToken: v.string(),
    notes: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      outletId: args.outletId,
      outletName: args.outletName,
      outletImage: args.outletImage,
      items: args.items,
      subtotal: args.subtotal,
      tax: args.tax,
      discount: args.discount,
      totalAmount: args.totalAmount,
      couponCode: args.couponCode,
      status: "placed",
      statusHistory: [
        { status: "placed", timestamp: Date.now() },
      ],
      pickupSlot: args.pickupSlot,
      pickupToken: args.pickupToken,
      notes: args.notes,
      paymentStatus: args.paymentStatus,
      estimatedReadyTime: Date.now() + 15 * 60 * 1000,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "order_update",
      title: "Order Placed! 📋",
      message: `Your order at ${args.outletName} has been placed. Token: ${args.pickupToken}`,
      orderId,
      isRead: false,
    });

    return orderId;
  },
});

export const getMyOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActiveOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return orders.filter(
      (o) => !["picked_up", "cancelled"].includes(o.status)
    );
  },
});

export const getOutletOrders = query({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("accepted"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("picked_up"),
      v.literal("cancelled")
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const statusHistory = [
      ...order.statusHistory,
      { status: args.status, timestamp: Date.now(), note: args.note },
    ];

    const updates: Record<string, unknown> = {
      status: args.status,
      statusHistory,
    };

    // Set estimated ready time when accepted
    if (args.status === "accepted") {
      updates.estimatedReadyTime = Date.now() + 15 * 60 * 1000;
    }

    await ctx.db.patch(args.orderId, updates);

    // Create notification
    const statusLabels: Record<string, string> = {
      accepted: "Order Accepted ✅",
      preparing: "Preparing Your Order 👨‍🍳",
      ready: "Order Ready! 🎉",
      picked_up: "Order Complete ✅",
      cancelled: "Order Cancelled ❌",
    };

    await ctx.db.insert("notifications", {
      userId: order.userId,
      type: "order_update",
      title: statusLabels[args.status] || "Order Update",
      message: `Your order at ${order.outletName} is now: ${args.status}. Token: ${order.pickupToken}`,
      orderId: args.orderId,
      isRead: false,
    });
  },
});

export const cancel = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (!["placed", "accepted"].includes(order.status)) {
      throw new Error("Cannot cancel order in current status");
    }

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      statusHistory: [
        ...order.statusHistory,
        { status: "cancelled", timestamp: Date.now() },
      ],
    });
  },
});
