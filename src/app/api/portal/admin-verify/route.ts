import { NextRequest, NextResponse } from "next/server";

const ADMIN_KEY = process.env.ADMIN_PORTAL_KEY || "";
const SECRET = process.env.PORTAL_COOKIE_SECRET || "fallback_secret";
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

// In-memory rate limiter (production should use Redis/KV)
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
    const { key } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Rate limiting check
    const entry = attempts.get(ip);
    if (entry && entry.lockedUntil > Date.now()) {
      const remainingSec = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many attempts. Try again later.", remainingSeconds: remainingSec, locked: true },
        { status: 429 }
      );
    }

    // Validate key format
    if (!key || typeof key !== "string" || key.length !== 6) {
      return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
    }

    // Validate against env — exact match, case-sensitive
    if (key !== ADMIN_KEY) {
      const current = attempts.get(ip) || { count: 0, lockedUntil: 0 };
      current.count++;

      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = Date.now() + COOLDOWN_MS;
        current.count = 0;
        attempts.set(ip, current);
        return NextResponse.json(
          { error: "Portal locked for 5 minutes due to too many failed attempts.", locked: true, remainingSeconds: 300 },
          { status: 429 }
        );
      }

      attempts.set(ip, current);
      return NextResponse.json(
        { error: "Invalid access key", attemptsRemaining: MAX_ATTEMPTS - current.count },
        { status: 401 }
      );
    }

    // Success — clear rate limit & issue signed cookie
    attempts.delete(ip);

    const timestamp = Date.now().toString();
    const payload = `admin:${timestamp}`;
    const signature = await signToken(payload);
    const cookieValue = `${payload}:${signature}`;

    const response = NextResponse.json({ success: true });
    response.cookies.set("swifttray_admin_access", cookieValue, {
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
