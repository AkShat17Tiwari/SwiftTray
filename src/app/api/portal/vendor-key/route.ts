import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.PORTAL_COOKIE_SECRET || "fallback_secret";
const SESSION_EXPIRY_MS = 12 * 60 * 60 * 1000;

// In-memory vendor key store (production should use database/Convex)
const vendorKeys = new Map<string, { vendorUserId: string; outletId: string; createdAt: number }>();

function generateUniqueKey(): string {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let i = 0; i < 6; i++) {
    key += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return key;
}

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

/**
 * POST /api/portal/vendor-key
 * Actions:
 *   { action: "generate", vendorUserId }   → generates and returns a new key
 *   { action: "validate", key, vendorUserId } → validates a key
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, vendorUserId, key: inputKey } = body;

    if (!vendorUserId) {
      return NextResponse.json({ error: "Missing vendorUserId" }, { status: 400 });
    }

    if (action === "generate") {
      // Check if vendor already has a key
      for (const [existingKey, data] of vendorKeys.entries()) {
        if (data.vendorUserId === vendorUserId) {
          return NextResponse.json({ key: existingKey, alreadyExists: true });
        }
      }

      // Generate new unique key
      let newKey = generateUniqueKey();
      let attempts = 0;
      while (vendorKeys.has(newKey) && attempts < 20) {
        newKey = generateUniqueKey();
        attempts++;
      }

      vendorKeys.set(newKey, {
        vendorUserId,
        outletId: "default",
        createdAt: Date.now(),
      });

      // Also issue session cookie
      const timestamp = Date.now().toString();
      const payload = `vendor:${vendorUserId}:default:${timestamp}`;
      const signature = await signToken(payload);
      const cookieValue = `${payload}:${signature}`;

      const response = NextResponse.json({ key: newKey, alreadyExists: false });
      response.cookies.set("swifttray_vendor_access", cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_EXPIRY_MS / 1000,
      });

      return response;

    } else if (action === "validate") {
      if (!inputKey || typeof inputKey !== "string" || inputKey.length !== 6) {
        return NextResponse.json({ valid: false, error: "Invalid key format" }, { status: 400 });
      }

      const record = vendorKeys.get(inputKey.toUpperCase());

      if (!record) {
        return NextResponse.json({ valid: false, error: "Invalid vendor key" });
      }

      if (record.vendorUserId !== vendorUserId) {
        return NextResponse.json({ valid: false, error: "Key does not belong to this account" });
      }

      // Issue session cookie
      const timestamp = Date.now().toString();
      const payload = `vendor:${vendorUserId}:${record.outletId}:${timestamp}`;
      const signature = await signToken(payload);
      const cookieValue = `${payload}:${signature}`;

      const response = NextResponse.json({ valid: true, outletId: record.outletId });
      response.cookies.set("swifttray_vendor_access", cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_EXPIRY_MS / 1000,
      });

      return response;

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
