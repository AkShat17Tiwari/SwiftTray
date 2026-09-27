import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  canManageOrder,
  requireAdmin,
  requireProfile,
  requirePrivilegedPortalAccess,
  requireVendorForOutlet,
} from "./lib/auth";
import { moneyToPaise, paiseToMoney } from "./lib/money";
import { canTransitionOrder } from "./lib/orderState";

const TAX_RATE = 0.05;
const PICKUP_SLOTS = new Set([
  "ASAP",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
]);
const statusValidator = v.union(
  v.literal("placed"),
  v.literal("accepted"),
  v.literal("preparing"),
  v.literal("ready"),
  v.literal("picked_up"),
  v.literal("cancelled")
);

async function createUniquePickupToken(ctx: Parameters<typeof requireProfile>[0]) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const random = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
    const token = random.toString().padStart(6, "0");
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_pickupToken", (q) => q.eq("pickupToken", token))
      .first();
    if (!existing || ["picked_up", "cancelled"].includes(existing.status)) {
      return token;
    }
  }
  throw new ConvexError("Could not allocate a pickup token. Please retry.");
}

async function releaseCouponReservation(
  ctx: MutationCtx,
  couponCode: string | undefined
) {
  if (!couponCode) return;
  const coupon = await ctx.db
    .query("coupons")
    .withIndex("by_code", (q) => q.eq("code", couponCode))
    .unique();
  if (coupon && coupon.usedCount > 0) {
    await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount - 1 });
  }
}

export const place = mutation({
  args: {
    outletId: v.id("outlets"),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
        customizations: v.array(
          v.object({ name: v.string(), selected: v.string() })
        ),
      })
    ),
    couponCode: v.optional(v.string()),
    pickupSlot: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    const outlet = await ctx.db.get(args.outletId);
    if (!outlet || outlet.status !== "active") {
      throw new ConvexError("This outlet is not available.");
    }
    if (!outlet.isOpen) throw new ConvexError("This outlet is currently closed.");
    if (args.items.length === 0 || args.items.length > 30) {
      throw new ConvexError("Your cart must contain between 1 and 30 items.");
    }
    if (!PICKUP_SLOTS.has(args.pickupSlot)) {
      throw new ConvexError("Choose a valid pickup time.");
    }
    if (args.notes && args.notes.length > 500) {
      throw new ConvexError("Special instructions must be 500 characters or less.");
    }

    const merged = new Map<
      string,
      { menuItemId: (typeof args.items)[number]["menuItemId"]; quantity: number; customizations: (typeof args.items)[number]["customizations"] }
    >();
    const quantitiesByMenuItem = new Map<string, number>();
    for (const requested of args.items) {
      if (!Number.isInteger(requested.quantity) || requested.quantity < 1) {
        throw new ConvexError("Item quantities must be positive whole numbers.");
      }
      const canonicalCustomizations = [...requested.customizations].sort((left, right) =>
        left.name.localeCompare(right.name)
      );
      const key = `${requested.menuItemId}:${JSON.stringify(canonicalCustomizations)}`;
      const prior = merged.get(key);
      const quantity = (prior?.quantity ?? 0) + requested.quantity;
      const itemQuantity = (quantitiesByMenuItem.get(String(requested.menuItemId)) ?? 0) + requested.quantity;
      if (itemQuantity > 20) throw new ConvexError("Maximum quantity per item is 20.");
      quantitiesByMenuItem.set(String(requested.menuItemId), itemQuantity);
      merged.set(key, { ...requested, customizations: canonicalCustomizations, quantity });
    }

    const verifiedItems: Doc<"orders">["items"] = [];
    let subtotalPaise = 0;
    for (const requested of merged.values()) {
      const menuItem = await ctx.db.get(requested.menuItemId);
      if (
        !menuItem ||
        menuItem.outletId !== args.outletId ||
        !menuItem.isAvailable
      ) {
        throw new ConvexError("One or more cart items are no longer available.");
      }

      const selections = new Map<string, string>();
      for (const selection of requested.customizations) {
        if (selections.has(selection.name)) {
          throw new ConvexError(`Choose only one option for ${selection.name}.`);
        }
        selections.set(selection.name, selection.selected);
      }

      const verifiedCustomizations: Doc<"orders">["items"][number]["customizations"] = [];
      let unitPaise = moneyToPaise(menuItem.price);
      for (const group of menuItem.customizations) {
        const selected = selections.get(group.name);
        if (!selected) {
          if (group.required) {
            throw new ConvexError(`Choose an option for ${group.name}.`);
          }
          continue;
        }
        const option = group.options.find((candidate) => candidate.label === selected);
        if (!option) throw new ConvexError(`Invalid option for ${group.name}.`);
        verifiedCustomizations.push({
          name: group.name,
          selected: option.label,
          price: option.price,
        });
        unitPaise += moneyToPaise(option.price);
        selections.delete(group.name);
      }
      if (selections.size > 0) {
        throw new ConvexError("An unknown customization was submitted.");
      }

      subtotalPaise += unitPaise * requested.quantity;
      verifiedItems.push({
        menuItemId: String(menuItem._id),
        name: menuItem.name,
        price: menuItem.price,
        quantity: requested.quantity,
        customizations: verifiedCustomizations,
      });
    }

    let discountPaise = 0;
    let coupon: Doc<"coupons"> | null = null;
    const couponCode = args.couponCode?.trim().toUpperCase();
    if (couponCode) {
      coupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", couponCode))
        .unique();
      if (!coupon || !coupon.isActive || Date.now() > coupon.validUntil) {
        throw new ConvexError("That coupon is invalid or expired.");
      }
      if (coupon.usedCount >= coupon.usageLimit) {
        throw new ConvexError("That coupon has reached its usage limit.");
      }
      if (coupon.outletId && coupon.outletId !== args.outletId) {
        throw new ConvexError("That coupon is not valid for this outlet.");
      }
      if (subtotalPaise < moneyToPaise(coupon.minOrder)) {
        throw new ConvexError(`This coupon requires a ₹${coupon.minOrder} minimum.`);
      }
      discountPaise =
        coupon.discountType === "percentage"
          ? Math.min(
              Math.round((subtotalPaise * coupon.discountValue) / 100),
              moneyToPaise(coupon.maxDiscount)
            )
          : Math.min(moneyToPaise(coupon.discountValue), subtotalPaise);
    }

    const taxPaise = Math.round(subtotalPaise * TAX_RATE);
    const totalPaise = subtotalPaise + taxPaise - discountPaise;
    if (totalPaise < 100) {
      throw new ConvexError("The final order total must be at least ₹1.");
    }

    const pickupToken = await createUniquePickupToken(ctx);
    const orderId = await ctx.db.insert("orders", {
      userId: current.userId,
      outletId: outlet._id,
      outletName: outlet.name,
      outletImage: outlet.image,
      items: verifiedItems,
      subtotal: paiseToMoney(subtotalPaise),
      tax: paiseToMoney(taxPaise),
      discount: paiseToMoney(discountPaise),
      totalAmount: paiseToMoney(totalPaise),
      couponCode,
      status: "placed",
      statusHistory: [{ status: "placed", timestamp: Date.now() }],
      pickupSlot: args.pickupSlot.trim(),
      pickupToken,
      notes: args.notes?.trim() || undefined,
      paymentStatus: "pending",
    });

    if (coupon) {
      await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount + 1 });
    }
    await ctx.db.insert("notifications", {
      userId: current.userId,
      type: "order_update",
      title: "Order saved",
      message: `Complete payment to send your ${outlet.name} order to the kitchen.`,
      orderId,
      isRead: false,
    });
    return orderId;
  },
});

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    return await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", current.userId))
      .order("desc")
      .collect();
  },
});

export const list = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return args.status
      ? await ctx.db
          .query("orders")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("orders").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    const order = await ctx.db.get(args.id);
    if (!order) return null;
    if (order.userId !== current.userId) {
      requirePrivilegedPortalAccess(current);
    }
    const canView =
      order.userId === current.userId ||
      ["admin", "super_admin"].includes(current.profile.role) ||
      (current.profile.role === "vendor" &&
        current.profile.assignedOutletId === order.outletId);
    if (!canView) throw new ConvexError("You cannot view this order.");
    return order;
  },
});

export const getActiveOrders = query({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", current.userId))
      .collect();
    return orders.filter((order) =>
      !["picked_up", "cancelled"].includes(order.status)
    );
  },
});

export const getOutletOrders = query({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    await requireVendorForOutlet(ctx, args.outletId);
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
    status: statusValidator,
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError("Order not found.");
    await canManageOrder(ctx, order);
    if (!canTransitionOrder(order.status, args.status)) {
      throw new ConvexError(`Cannot move an order from ${order.status} to ${args.status}.`);
    }
    if (args.status === "accepted" && order.paymentStatus !== "completed") {
      throw new ConvexError("This order cannot be accepted until payment is captured.");
    }
    if (args.status === "cancelled" && order.paymentStatus === "completed") {
      throw new ConvexError("Paid orders must be refunded before cancellation.");
    }

    await ctx.db.patch(args.orderId, {
      status: args.status,
      statusHistory: [
        ...order.statusHistory,
        {
          status: args.status,
          timestamp: Date.now(),
          note: args.note?.trim().slice(0, 200) || undefined,
        },
      ],
      estimatedReadyTime:
        args.status === "accepted"
          ? Date.now() + 15 * 60 * 1000
          : order.estimatedReadyTime,
    });
    if (args.status === "cancelled") {
      await releaseCouponReservation(ctx, order.couponCode);
    }

    const labels: Partial<Record<Doc<"orders">["status"], string>> = {
      accepted: "Order accepted",
      preparing: "Your food is being prepared",
      ready: "Order ready for pickup",
      picked_up: "Order complete",
      cancelled: "Order cancelled",
    };
    await ctx.db.insert("notifications", {
      userId: order.userId,
      type: "order_update",
      title: labels[args.status] ?? "Order updated",
      message: `Your ${order.outletName} order is now ${args.status.replace("_", " ")}.`,
      orderId: args.orderId,
      isRead: false,
    });
  },
});

export const cancel = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== current.userId) {
      throw new ConvexError("Order not found.");
    }
    if (order.status !== "placed") {
      throw new ConvexError("Only an unaccepted order can be cancelled.");
    }
    if (order.paymentStatus === "completed") {
      throw new ConvexError("Contact support to cancel and refund a paid order.");
    }
    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      statusHistory: [
        ...order.statusHistory,
        { status: "cancelled", timestamp: Date.now() },
      ],
    });
    await releaseCouponReservation(ctx, order.couponCode);
  },
});
