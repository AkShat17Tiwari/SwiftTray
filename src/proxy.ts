import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protected route matchers
const isVendorRoute = createRouteMatcher(["/vendor(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isStudentRoute = createRouteMatcher([
  "/student(.*)",
  "/dashboard(.*)",
  "/orders(.*)",
  "/checkout(.*)",
]);

// Access gate pages (must NOT require access cookie)
const isAdminAccessPage = createRouteMatcher(["/admin/access"]);
const isVendorAccessPage = createRouteMatcher(["/vendor/access"]);

// Portal API routes (must be accessible for key verification)
const isPortalAPI = createRouteMatcher(["/api/portal(.*)"]);

const COOKIE_SECRET = process.env.PORTAL_COOKIE_SECRET || "fallback_secret";
const SESSION_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Verify an HMAC-signed portal cookie.
 * Cookie format: `{payload}:{hmac_signature}`
 * Payload format: `portal_type:...fields...:timestamp`
 */
async function verifyCookie(cookieValue: string, expectedPrefix: string): Promise<boolean> {
  try {
    const parts = cookieValue.split(":");
    if (parts.length < 3) return false;

    // Last element is the signature, everything before is the payload
    const signature = parts[parts.length - 1];
    const payload = parts.slice(0, -1).join(":");

    // Check prefix
    if (!payload.startsWith(expectedPrefix)) return false;

    // Extract timestamp (second-to-last element before signature)
    const timestamp = parseInt(parts[parts.length - 2], 10);
    if (isNaN(timestamp)) return false;

    // Check expiry (12 hours)
    if (Date.now() - timestamp > SESSION_EXPIRY_MS) return false;

    // Verify HMAC using Web Crypto API (available in Edge Runtime)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(COOKIE_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const expectedSig = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expectedSig === signature;
  } catch {
    return false;
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();
  const role = sessionClaims?.metadata?.role || "student";

  // ------------------------------------------------------------------
  // Portal API routes — require Clerk auth but NOT portal cookies
  // ------------------------------------------------------------------
  if (isPortalAPI(req)) {
    return; // Let the API route handlers do their own validation
  }

  // ------------------------------------------------------------------
  // ADMIN ROUTES
  // ------------------------------------------------------------------
  if (isAdminRoute(req)) {
    // Step 1: Clerk auth
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Step 2: RBAC role check
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Step 3: Allow access gate page without cookie
    if (isAdminAccessPage(req)) {
      // If already verified, redirect to admin dashboard
      const adminCookie = req.cookies.get("swifttray_admin_access")?.value;
      if (adminCookie && await verifyCookie(adminCookie, "admin:")) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return; // Show access gate
    }

    // Step 4: Verify portal access cookie for all other admin routes
    const adminCookie = req.cookies.get("swifttray_admin_access")?.value;
    if (!adminCookie || !(await verifyCookie(adminCookie, "admin:"))) {
      return NextResponse.redirect(new URL("/admin/access", req.url));
    }
  }

  // ------------------------------------------------------------------
  // VENDOR ROUTES
  // ------------------------------------------------------------------
  if (isVendorRoute(req)) {
    // Step 1: Clerk auth
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Step 2: RBAC role check
    if (role !== "vendor" && role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Step 3: Allow access gate page without cookie
    if (isVendorAccessPage(req)) {
      const vendorCookie = req.cookies.get("swifttray_vendor_access")?.value;
      if (vendorCookie && await verifyCookie(vendorCookie, "vendor:")) {
        return NextResponse.redirect(new URL("/vendor", req.url));
      }
      return; // Show access gate
    }

    // Step 4: Verify portal access cookie
    const vendorCookie = req.cookies.get("swifttray_vendor_access")?.value;
    if (!vendorCookie || !(await verifyCookie(vendorCookie, "vendor:"))) {
      return NextResponse.redirect(new URL("/vendor/access", req.url));
    }
  }

  // ------------------------------------------------------------------
  // STUDENT ROUTES
  // ------------------------------------------------------------------
  if (isStudentRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
