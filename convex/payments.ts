import { ConvexError, v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { requirePrivilegedPortalAccess, requireProfile } from "./lib/auth";
import {
  captureRazorpayPayment,
  createRazorpayOrder,
  createRazorpayRefund,
  fetchRazorpayPayment,
  getRazorpayConfig,
  toPaise,
  verifyPaymentSignature,
} from "./lib/razorpay";

const gatewayStatusValidator = v.union(
  v.literal("created"),
  v.literal("authorized"),
  v.literal("captured"),
  v.literal("refunded"),
  v.literal("failed")
);

interface CheckoutCustomer {
  name?: string;
  email?: string;
  contact?: string;
}

interface PaymentInfo {
  order: Doc<"orders"> | null;
  attemptCount: number;
  latestAttempt: Doc<"payments"> | null;
  customer: CheckoutCustomer;
}

interface InitiatePaymentResult {
  keyId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: "INR";
  attempt: number;
  customer: CheckoutCustomer;
  outletName: string;
}

function publicGatewayError(error: unknown): string {
  console.error("Razorpay operation failed", error);
  return "The payment gateway is temporarily unavailable. Your food order is saved; please try again.";
}

export const initiatePayment = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args): Promise<InitiatePaymentResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Please sign in to pay for an order.");

    const config = getRazorpayConfig();
    if (!config) {
      throw new ConvexError(
        "Online payments are not configured. Add the Razorpay keys to the Convex deployment."
      );
    }

    const info: PaymentInfo = await ctx.runQuery(internal.payments.getOrderForPayment, {
      orderId: args.orderId,
      userId: identity.subject,
    });
    if (!info.order) throw new ConvexError("Order not found.");
    if (info.order.paymentStatus === "completed") {
      throw new ConvexError("This order is already paid.");
    }
    if (info.order.status === "cancelled") {
      throw new ConvexError("This order has been cancelled.");
    }

    const amountInPaise = toPaise(info.order.totalAmount);
    if (amountInPaise < 100) {
      throw new ConvexError("Razorpay requires a minimum payment of ₹1.");
    }

    if (
      info.latestAttempt?.razorpayOrderId &&
      ["created", "pending"].includes(info.latestAttempt.status)
    ) {
      return {
        keyId: config.keyId,
        razorpayOrderId: info.latestAttempt.razorpayOrderId,
        amountInPaise,
        currency: "INR" as const,
        attempt: info.latestAttempt.attempt,
        customer: info.customer,
        outletName: info.order.outletName,
      };
    }

    const attempt = info.attemptCount + 1;
    try {
      const gatewayOrder = await createRazorpayOrder(config, {
        amountInPaise,
        receipt: `ST${Date.now().toString(36)}${attempt}`,
        notes: {
          swifttrayOrderId: String(args.orderId),
          outlet: info.order.outletName.slice(0, 64),
        },
      });

      if (
        gatewayOrder.amount !== amountInPaise ||
        gatewayOrder.currency !== "INR"
      ) {
        throw new Error("Razorpay returned a mismatched order amount or currency.");
      }

      await ctx.runMutation(internal.payments.recordAttempt, {
        orderId: args.orderId,
        razorpayOrderId: gatewayOrder.id,
        attempt,
        amount: info.order.totalAmount,
        amountInPaise,
      });

      return {
        keyId: config.keyId,
        razorpayOrderId: gatewayOrder.id,
        amountInPaise,
        currency: "INR" as const,
        attempt,
        customer: info.customer,
        outletName: info.order.outletName,
      };
    } catch (error) {
      throw new ConvexError(publicGatewayError(error));
    }
  },
});

export const verifyPayment = action({
  args: {
    orderId: v.id("orders"),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Please sign in to verify this payment.");
    const config = getRazorpayConfig();
    if (!config) throw new ConvexError("Online payments are not configured.");

    const attempt = await ctx.runQuery(internal.payments.getAttemptForVerification, {
      orderId: args.orderId,
      userId: identity.subject,
      razorpayOrderId: args.razorpayOrderId,
    });
    if (!attempt) throw new ConvexError("Payment attempt not found.");

    const signatureValid = await verifyPaymentSignature({
      orderId: attempt.razorpayOrderId,
      paymentId: args.razorpayPaymentId,
      signature: args.razorpaySignature,
      secret: config.keySecret,
    });
    if (!signatureValid) {
      throw new ConvexError("Payment verification failed. The order was not marked paid.");
    }

    try {
      let payment = await fetchRazorpayPayment(config, args.razorpayPaymentId);
      if (
        payment.order_id !== attempt.razorpayOrderId ||
        payment.amount !== attempt.amountInPaise ||
        payment.currency !== "INR"
      ) {
        throw new ConvexError("Payment details do not match this order.");
      }

      if (payment.status === "authorized") {
        payment = await captureRazorpayPayment(
          config,
          payment.id,
          attempt.amountInPaise
        );
      }

      await ctx.runMutation(internal.payments.applyRazorpayStatus, {
        razorpayOrderId: attempt.razorpayOrderId,
        razorpayPaymentId: payment.id,
        razorpaySignature: args.razorpaySignature,
        gatewayStatus: payment.status,
        amountInPaise: payment.amount,
        currency: payment.currency,
      });

      return {
        state:
          payment.status === "captured"
            ? ("paid" as const)
            : payment.status === "failed"
              ? ("failed" as const)
              : ("pending" as const),
      };
    } catch (error) {
      if (error instanceof ConvexError) throw error;
      throw new ConvexError(publicGatewayError(error));
    }
  },
});

export const refundPayment = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args): Promise<{ state: "refunded" | "pending" }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Please sign in to refund an order.");
    const config = getRazorpayConfig();
    if (!config) throw new ConvexError("Online payments are not configured.");
    const info = await ctx.runQuery(internal.payments.getRefundInfo, {
      orderId: args.orderId,
      userId: identity.subject,
    });
    if (!info) throw new ConvexError("A captured payment was not found or you do not have permission.");
    if (info.alreadyRefunded) return { state: "refunded" };
    try {
      const refund = await createRazorpayRefund(
        config,
        info.razorpayPaymentId,
        info.amountInPaise,
        { swifttrayOrderId: String(args.orderId) }
      );
      if (
        refund.payment_id !== info.razorpayPaymentId ||
        refund.amount !== info.amountInPaise ||
        refund.currency !== "INR"
      ) {
        throw new Error("Razorpay returned mismatched refund details.");
      }
      if (refund.status === "processed") {
        await ctx.runMutation(internal.payments.applyRefund, {
          razorpayPaymentId: refund.payment_id,
          amountInPaise: refund.amount,
          currency: refund.currency,
        });
      }
      return { state: refund.status === "processed" ? "refunded" : "pending" };
    } catch (error) {
      throw new ConvexError(publicGatewayError(error));
    }
  },
});

export const getPaymentState = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const isManager = ["admin", "super_admin"].includes(current.profile.role);
    const isAssignedVendor =
      current.profile.role === "vendor" &&
      current.profile.assignedOutletId === order.outletId;
    if (order.userId !== current.userId && !isManager && !isAssignedVendor) {
      throw new ConvexError("You cannot view this payment.");
    }
    if (order.userId !== current.userId) {
      requirePrivilegedPortalAccess(current);
    }

    const attempts = await ctx.db
      .query("payments")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
    const latest = attempts.reduce<null | (typeof attempts)[number]>(
      (selected, attempt) =>
        !selected || attempt.attempt > selected.attempt ? attempt : selected,
      null
    );

    return {
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      pickupToken:
        order.paymentStatus === "completed" ? order.pickupToken : undefined,
      outletName: order.outletName,
      totalAmount: order.totalAmount,
      latestAttempt: latest
        ? {
            attempt: latest.attempt,
            status: latest.status,
            gatewayStatus: latest.lastGatewayStatus,
          }
        : null,
    };
  },
});

export const getOrderForPayment = internalQuery({
  args: { orderId: v.id("orders"), userId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== args.userId) {
      return { order: null, attemptCount: 0, latestAttempt: null, customer: {} };
    }
    const attempts = await ctx.db
      .query("payments")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
    const latestAttempt = attempts.reduce<null | (typeof attempts)[number]>(
      (selected, attempt) =>
        !selected || attempt.attempt > selected.attempt ? attempt : selected,
      null
    );
    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", args.userId))
      .unique();
    return {
      order,
      attemptCount: attempts.length,
      latestAttempt,
      customer: {
        name: profile?.name,
        email: profile?.email,
        contact: profile?.phone,
      },
    };
  },
});

export const getAttemptForVerification = internalQuery({
  args: {
    orderId: v.id("orders"),
    userId: v.string(),
    razorpayOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== args.userId) return null;
    const attempt = await ctx.db
      .query("payments")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .unique();
    if (!attempt || attempt.orderId !== args.orderId || !attempt.razorpayOrderId) {
      return null;
    }
    return {
      razorpayOrderId: attempt.razorpayOrderId,
      amountInPaise: attempt.amountInPaise ?? toPaise(attempt.amount),
    };
  },
});

export const getAttemptByRazorpayOrderId = internalQuery({
  args: { razorpayOrderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .unique();
  },
});

export const getRefundInfo = internalQuery({
  args: { orderId: v.id("orders"), userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", args.userId))
      .unique();
    if (!profile || !["admin", "super_admin"].includes(profile.role)) return null;
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    if (order.paymentStatus === "refunded") {
      return { alreadyRefunded: true, razorpayPaymentId: "", amountInPaise: toPaise(order.totalAmount) };
    }
    if (order.paymentStatus !== "completed" || order.status === "picked_up") return null;
    const attempts = await ctx.db
      .query("payments")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
    const captured = attempts
      .filter((attempt) => attempt.status === "captured" && attempt.razorpayPaymentId)
      .sort((left, right) => right.attempt - left.attempt)[0];
    if (!captured?.razorpayPaymentId) return null;
    return {
      alreadyRefunded: false,
      razorpayPaymentId: captured.razorpayPaymentId,
      amountInPaise: captured.amountInPaise ?? toPaise(captured.amount),
    };
  },
});

export const recordAttempt = internalMutation({
  args: {
    orderId: v.id("orders"),
    razorpayOrderId: v.string(),
    attempt: v.number(),
    amount: v.number(),
    amountInPaise: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      ...args,
      currency: "INR",
      status: "created",
      lastGatewayStatus: "created",
    });
  },
});

export const applyRazorpayStatus = internalMutation({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.optional(v.string()),
    gatewayStatus: gatewayStatusValidator,
    amountInPaise: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db
      .query("payments")
      .withIndex("by_razorpayOrderId", (q) =>
        q.eq("razorpayOrderId", args.razorpayOrderId)
      )
      .unique();
    if (!attempt) return { applied: false, reason: "unknown_order" as const };

    const expectedAmount = attempt.amountInPaise ?? toPaise(attempt.amount);
    if (args.amountInPaise !== expectedAmount || args.currency !== "INR") {
      throw new ConvexError("Gateway payment amount or currency mismatch.");
    }
    if (
      attempt.razorpayPaymentId &&
      attempt.razorpayPaymentId !== args.razorpayPaymentId
    ) {
      throw new ConvexError("A different payment is already linked to this attempt.");
    }

    const normalizedStatus =
      args.gatewayStatus === "created" ? "pending" : args.gatewayStatus;
    const isCaptured = attempt.status === "captured";
    const nextStatus =
      isCaptured && args.gatewayStatus !== "refunded"
        ? "captured"
        : normalizedStatus;

    await ctx.db.patch(attempt._id, {
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySignature: args.razorpaySignature ?? attempt.razorpaySignature,
      status: nextStatus,
      lastGatewayStatus: args.gatewayStatus,
      lastEventAt: Date.now(),
    });

    const order = await ctx.db.get(attempt.orderId);
    if (!order) return { applied: false, reason: "unknown_food_order" as const };

    if (args.gatewayStatus === "captured" && order.paymentStatus !== "completed") {
      await ctx.db.patch(attempt.orderId, { paymentStatus: "completed" });
      for (const item of order.items) {
        const menuItemId = ctx.db.normalizeId("menuItems", item.menuItemId);
        if (!menuItemId) continue;
        const menuItem = await ctx.db.get(menuItemId);
        if (menuItem) {
          await ctx.db.patch(menuItemId, {
            orderCount: menuItem.orderCount + item.quantity,
          });
        }
      }
      await ctx.db.insert("notifications", {
        userId: order.userId,
        type: "order_update",
        title: "Payment received",
        message: `₹${order.totalAmount} received for your ${order.outletName} order. Pickup token: ${order.pickupToken}`,
        orderId: attempt.orderId,
        isRead: false,
      });
    } else if (args.gatewayStatus === "refunded") {
      await ctx.db.patch(attempt.orderId, { paymentStatus: "refunded" });
    } else if (
      args.gatewayStatus === "failed" &&
      order.paymentStatus !== "completed"
    ) {
      const attempts = await ctx.db
        .query("payments")
        .withIndex("by_orderId", (q) => q.eq("orderId", attempt.orderId))
        .collect();
      const latest = attempts.reduce((a, b) =>
        a.attempt > b.attempt ? a : b
      );
      if (latest._id === attempt._id) {
        await ctx.db.patch(attempt.orderId, { paymentStatus: "failed" });
      }
    }
    return { applied: true };
  },
});

export const applyRefund = internalMutation({
  args: {
    razorpayPaymentId: v.string(),
    amountInPaise: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db
      .query("payments")
      .withIndex("by_razorpayPaymentId", (q) => q.eq("razorpayPaymentId", args.razorpayPaymentId))
      .unique();
    if (!attempt) return { applied: false, reason: "unknown_payment" as const };
    const expectedAmount = attempt.amountInPaise ?? toPaise(attempt.amount);
    if (args.amountInPaise !== expectedAmount || args.currency !== "INR") {
      throw new ConvexError("Refund amount or currency mismatch.");
    }
    const order = await ctx.db.get(attempt.orderId);
    if (!order) return { applied: false, reason: "unknown_order" as const };
    if (order.paymentStatus === "refunded") return { applied: false, reason: "already_refunded" as const };
    await ctx.db.patch(attempt._id, { status: "refunded", lastGatewayStatus: "refunded", lastEventAt: Date.now() });
    await ctx.db.patch(order._id, {
      paymentStatus: "refunded",
      status: "cancelled",
      statusHistory: [...order.statusHistory, { status: "cancelled", timestamp: Date.now(), note: "Full Razorpay refund processed" }],
    });
    for (const item of order.items) {
      const menuItemId = ctx.db.normalizeId("menuItems", item.menuItemId);
      if (!menuItemId) continue;
      const menuItem = await ctx.db.get(menuItemId);
      if (menuItem) await ctx.db.patch(menuItemId, { orderCount: Math.max(0, menuItem.orderCount - item.quantity) });
    }
    if (order.couponCode) {
      const coupon = await ctx.db.query("coupons").withIndex("by_code", (q) => q.eq("code", order.couponCode!)).unique();
      if (coupon && coupon.usedCount > 0) await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount - 1 });
    }
    await ctx.db.insert("notifications", {
      userId: order.userId,
      type: "order_update",
      title: "Refund processed",
      message: `Your ${order.outletName} order was cancelled and ₹${order.totalAmount} was refunded through Razorpay.`,
      orderId: order._id,
      isRead: false,
    });
    return { applied: true };
  },
});

export const isWebhookEventProcessed = internalQuery({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    return Boolean(
      await ctx.db
        .query("razorpayWebhookEvents")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .unique()
    );
  },
});

export const recordWebhookEvent = internalMutation({
  args: {
    eventId: v.string(),
    eventName: v.string(),
    razorpayOrderId: v.optional(v.string()),
    razorpayPaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("razorpayWebhookEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();
    if (existing) return { alreadyProcessed: true };
    await ctx.db.insert("razorpayWebhookEvents", {
      ...args,
      createdAt: Date.now(),
    });
    return { alreadyProcessed: false };
  },
});

export const processWebhook = internalAction({
  args: {
    eventId: v.string(),
    eventName: v.string(),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    retryCount: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    if (
      await ctx.runQuery(internal.payments.isWebhookEventProcessed, {
        eventId: args.eventId,
      })
    ) {
      return;
    }

    try {
      const config = getRazorpayConfig();
      if (!config) throw new Error("Razorpay API keys are not configured.");
      const payment = await fetchRazorpayPayment(config, args.razorpayPaymentId);
      if (payment.order_id !== args.razorpayOrderId) {
        throw new Error("Webhook payment does not match its Razorpay order.");
      }

      const knownAttempt = await ctx.runQuery(
        internal.payments.getAttemptByRazorpayOrderId,
        { razorpayOrderId: args.razorpayOrderId }
      );
      if (knownAttempt) {
        await ctx.runMutation(internal.payments.applyRazorpayStatus, {
          razorpayOrderId: args.razorpayOrderId,
          razorpayPaymentId: payment.id,
          gatewayStatus: payment.status,
          amountInPaise: payment.amount,
          currency: payment.currency,
        });
      }

      await ctx.runMutation(internal.payments.recordWebhookEvent, {
        eventId: args.eventId,
        eventName: args.eventName,
        razorpayOrderId: args.razorpayOrderId,
        razorpayPaymentId: args.razorpayPaymentId,
      });
    } catch (error) {
      console.error("Razorpay webhook processing failed", error);
      const delays = [1_000, 5_000, 30_000, 120_000, 600_000];
      if (args.retryCount < delays.length) {
        await ctx.scheduler.runAfter(
          delays[args.retryCount],
          internal.payments.processWebhook,
          { ...args, retryCount: args.retryCount + 1 }
        );
      }
    }
  },
});

export type LatestAttempt = {
  _id: Id<"payments">;
  razorpayOrderId?: string;
  attempt: number;
} | null;
