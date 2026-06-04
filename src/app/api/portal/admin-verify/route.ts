import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL =
  process.env.ADMIN_PORTAL_EMAIL?.toLowerCase().trim() || "akshatr147@gmail.com";
const ADMIN_PASSWORD_SHA256 =
  process.env.ADMIN_PORTAL_PASSWORD_SHA256 ||
  "315416de9790b1879cb07ffef6e202b195ee743996054ded07691809952c201e";
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

async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const isFormPost = contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data");
    const body = isFormPost
      ? Object.fromEntries((await req.formData()).entries())
      : await req.json();
    const email = body.email;
    const password = body.password;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const errorResponse = (message: string, status: number, extra?: Record<string, unknown>) => {
      if (isFormPost) {
        const url = new URL("/admin/access", req.url);
        url.searchParams.set("error", message);
        return NextResponse.redirect(url, { status: 303 });
      }

      return NextResponse.json({ error: message, ...extra }, { status });
    };

    // Rate limiting check
    const entry = attempts.get(ip);
    if (entry && entry.lockedUntil > Date.now()) {
      const remainingSec = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
      return errorResponse("Too many attempts. Try again later.", 429, {
        remainingSeconds: remainingSec,
        locked: true,
      });
    }

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return errorResponse("Email and password are required", 400);
    }

    const emailMatches = email.toLowerCase().trim() === ADMIN_EMAIL;
    const passwordMatches = (await sha256(password)) === ADMIN_PASSWORD_SHA256;

    if (!emailMatches || !passwordMatches) {
      const current = attempts.get(ip) || { count: 0, lockedUntil: 0 };
      current.count++;

      if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = Date.now() + COOLDOWN_MS;
        current.count = 0;
        attempts.set(ip, current);
        return errorResponse("Portal locked for 5 minutes due to too many failed attempts.", 429, {
          locked: true,
          remainingSeconds: 300,
        });
      }

      attempts.set(ip, current);
      return errorResponse("Invalid admin credentials", 401, {
        attemptsRemaining: MAX_ATTEMPTS - current.count,
      });
    }

    // Success — clear rate limit & issue signed cookie
    attempts.delete(ip);

    const timestamp = Date.now().toString();
    const payload = `admin:${ADMIN_EMAIL}:${timestamp}`;
    const signature = await signToken(payload);
    const cookieValue = `${payload}:${signature}`;

    const response = isFormPost
      ? NextResponse.redirect(new URL("/admin", req.url), { status: 303 })
      : NextResponse.json({ success: true });
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
