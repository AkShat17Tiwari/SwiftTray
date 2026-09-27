import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  timingSafeEqual,
  toPaise,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../convex/lib/razorpay";

describe("Razorpay verification", () => {
  it("converts a positive charge to paise", () => {
    expect(toPaise(249.5)).toBe(24_950);
    expect(() => toPaise(0)).toThrow();
  });

  it("compares signatures without case sensitivity or prefix matches", () => {
    expect(timingSafeEqual("A1B2", "a1b2")).toBe(true);
    expect(timingSafeEqual("a1b2", "a1b20")).toBe(false);
    expect(timingSafeEqual("a1b2", "a1b3")).toBe(false);
  });

  it("verifies checkout signatures against the stored order id", async () => {
    const secret = "test-secret";
    const orderId = "order_123";
    const paymentId = "pay_456";
    const signature = createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    await expect(
      verifyPaymentSignature({ orderId, paymentId, signature, secret })
    ).resolves.toBe(true);
    await expect(
      verifyPaymentSignature({ orderId: "order_tampered", paymentId, signature, secret })
    ).resolves.toBe(false);
  });

  it("verifies the exact raw webhook body", async () => {
    const secret = "webhook-secret";
    const rawBody = '{"event":"payment.captured"}';
    const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
    await expect(verifyWebhookSignature({ rawBody, signature, secret })).resolves.toBe(true);
    await expect(
      verifyWebhookSignature({ rawBody: `${rawBody} `, signature, secret })
    ).resolves.toBe(false);
  });
});
