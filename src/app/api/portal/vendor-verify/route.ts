import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

const SECRET = process.env.PORTAL_COOKIE_SECRET || "fallback_secret";
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 5 * 60 * 1000;
const SESSION_EXPIRY_MS = 12 * 60 * 60 * 1000;

const attempts = new Map<string, { count: number; lockedUntil: number }>();

type VendorKeyValidation = {
  valid: boolean;
  error?: string;
  outletId?: string;
};

async function signToken(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, vendorUserId } = body;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `vendor:${ip}:${vendorUserId || "anon"}`;

    // Rate limiting
    const entry = attempts.get(rateLimitKey);
    if (entry && entry.lockedUntil > Date.now()) {
      const remainingSec = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many attempts. Try again later.", remainingSeconds: remainingSec, locked: true },
        { status: 429 }
      );
    }

    if (!vendorUserId || !key) {
      return NextResponse.json({ error: "Missing vendor credentials" }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Convex is not configured" }, { status: 500 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    const validation = (await convex.mutation(api.vendorKeys.validateKey, {
      key,
      vendorUserId,
    })) as VendorKeyValidation;

    if (!validation.valid || !validation.outletId) {
      const current = attempts.get(rateLimitKey) || { count: 0, lockedUntil: 0 };
      current.count++;

      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = Date.now() + COOLDOWN_MS;
        current.count = 0;
        attempts.set(rateLimitKey, current);
        return NextResponse.json(
          { error: "Portal locked for 5 minutes due to too many failed attempts.", locked: true, remainingSeconds: 300 },
          { status: 429 }
        );
      }

      attempts.set(rateLimitKey, current);
      return NextResponse.json(
        {
          error: validation.error || "Invalid vendor key",
          attemptsRemaining: MAX_ATTEMPTS - current.count,
        },
        { status: 401 }
      );
    }

    attempts.delete(rateLimitKey);

    const timestamp = Date.now().toString();
    const payload = `vendor:${vendorUserId}:${validation.outletId}:${timestamp}`;
    const signature = await signToken(payload);
    const cookieValue = `${payload}:${signature}`;

    const response = NextResponse.json({ success: true });
    response.cookies.set("swifttray_vendor_access", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_EXPIRY_MS / 1000,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
