import type {
  RazorpayOrder,
  RazorpayPayment,
  RazorpayRefund,
} from "../../src/types/razorpay";

const API_BASE = "https://api.razorpay.com/v1";

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string | null;
}

export class RazorpayApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody: string
  ) {
    super(message);
    this.name = "RazorpayApiError";
  }
}

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return {
    keyId,
    keySecret,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? null,
  };
}

function apiHeaders(config: RazorpayConfig) {
  return {
    Authorization: `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}`,
    "Content-Type": "application/json",
  };
}

async function parseResponse<T>(response: Response, operation: string): Promise<T> {
  const body = await response.text();
  if (!response.ok) {
    throw new RazorpayApiError(
      `${operation} failed with HTTP ${response.status}`,
      response.status,
      body.slice(0, 1000)
    );
  }
  return JSON.parse(body) as T;
}

export function toPaise(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be positive.");
  }
  return Math.round((amount + Number.EPSILON) * 100);
}

export async function createRazorpayOrder(
  config: RazorpayConfig,
  input: {
    amountInPaise: number;
    receipt: string;
    notes: Record<string, string>;
  }
): Promise<RazorpayOrder> {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: apiHeaders(config),
    body: JSON.stringify({
      amount: input.amountInPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes,
    }),
  });
  return parseResponse<RazorpayOrder>(response, "Razorpay order creation");
}

export async function fetchRazorpayPayment(
  config: RazorpayConfig,
  paymentId: string
): Promise<RazorpayPayment> {
  const response = await fetch(
    `${API_BASE}/payments/${encodeURIComponent(paymentId)}`,
    { headers: apiHeaders(config) }
  );
  return parseResponse<RazorpayPayment>(response, "Razorpay payment lookup");
}

export async function captureRazorpayPayment(
  config: RazorpayConfig,
  paymentId: string,
  amountInPaise: number
): Promise<RazorpayPayment> {
  const response = await fetch(
    `${API_BASE}/payments/${encodeURIComponent(paymentId)}/capture`,
    {
      method: "POST",
      headers: apiHeaders(config),
      body: JSON.stringify({ amount: amountInPaise, currency: "INR" }),
    }
  );
  return parseResponse<RazorpayPayment>(response, "Razorpay payment capture");
}

export async function createRazorpayRefund(
  config: RazorpayConfig,
  paymentId: string,
  amountInPaise: number,
  notes: Record<string, string>
): Promise<RazorpayRefund> {
  const response = await fetch(
    `${API_BASE}/payments/${encodeURIComponent(paymentId)}/refund`,
    {
      method: "POST",
      headers: apiHeaders(config),
      body: JSON.stringify({ amount: amountInPaise, notes }),
    }
  );
  return parseResponse<RazorpayRefund>(response, "Razorpay refund creation");
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToHex(new Uint8Array(digest));
}

export function timingSafeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a.toLowerCase());
  const right = new TextEncoder().encode(b.toLowerCase());
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

export async function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): Promise<boolean> {
  const expected = await hmacSha256(
    `${input.orderId}|${input.paymentId}`,
    input.secret
  );
  return timingSafeEqual(expected, input.signature);
}

export async function verifyWebhookSignature(input: {
  rawBody: string;
  signature: string;
  secret: string;
}): Promise<boolean> {
  const expected = await hmacSha256(input.rawBody, input.secret);
  return timingSafeEqual(expected, input.signature);
}
