import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.PORTAL_COOKIE_SECRET || "fallback_secret";
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 5 * 60 * 1000;
const SESSION_EXPIRY_MS = 12 * 60 * 60 * 1000;

const attempts = new Map<string, { count: number; lockedUntil: number }>();

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
    const { vendorUserId, outletId } = body;
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

    if (!vendorUserId) {
      return NextResponse.json({ error: "Missing vendor credentials" }, { status: 400 });
    }

    // Key validation happens via Convex on the client side.
    // This endpoint issues the session cookie after client confirms validity.
    attempts.delete(rateLimitKey);

    const timestamp = Date.now().toString();
    const payload = `vendor:${vendorUserId}:${outletId || "all"}:${timestamp}`;
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
