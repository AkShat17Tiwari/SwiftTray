import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import {
  getRazorpayConfig,
  verifyWebhookSignature,
} from "./lib/razorpay";
import type { RazorpayWebhookEvent } from "../src/types/razorpay";

const razorpayWebhook = httpAction(async (ctx, request) => {
  const config = getRazorpayConfig();
  if (!config?.webhookSecret) {
    return new Response("Webhook is not configured", { status: 503 });
  }

  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventId = request.headers.get("x-razorpay-event-id") ?? "";
  const rawBody = await request.text();
  if (
    !signature ||
    !eventId ||
    !(await verifyWebhookSignature({
      rawBody,
      signature,
      secret: config.webhookSecret,
    }))
  ) {
    return new Response("Invalid webhook signature", { status: 401 });
  }

  if (
    await ctx.runQuery(internal.payments.isWebhookEventProcessed, { eventId })
  ) {
    return Response.json({ ok: true, duplicate: true });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return new Response("Malformed JSON", { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const refund = event.payload?.refund?.entity;
  if (event.event === "refund.processed" && refund?.payment_id) {
    await ctx.runMutation(internal.payments.applyRefund, {
      razorpayPaymentId: refund.payment_id,
      amountInPaise: refund.amount,
      currency: refund.currency,
    });
    await ctx.runMutation(internal.payments.recordWebhookEvent, {
      eventId,
      eventName: event.event,
      razorpayPaymentId: refund.payment_id,
    });
    return Response.json({ ok: true, refunded: true });
  }
  if (!payment?.id || !payment.order_id) {
    await ctx.runMutation(internal.payments.recordWebhookEvent, {
      eventId,
      eventName: event.event || "unknown",
    });
    return Response.json({ ok: true, skipped: true });
  }

  await ctx.scheduler.runAfter(0, internal.payments.processWebhook, {
    eventId,
    eventName: event.event,
    razorpayOrderId: payment.order_id,
    razorpayPaymentId: payment.id,
    retryCount: 0,
  });
  return Response.json({ ok: true, queued: true });
});

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/razorpay/webhook",
  method: "POST",
  handler: razorpayWebhook,
});

export default http;
