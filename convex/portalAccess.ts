import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { recordAudit, requireAdmin, requireProfile } from "./lib/auth";
import {
  generateSixDigitCode,
  hashPortalCode,
  isSixDigitCode,
  MAX_PORTAL_ATTEMPTS,
  PORTAL_ACCESS_DURATION_MS,
  PORTAL_LOCK_DURATION_MS,
  portalCodePepper,
  secureHashEqual,
} from "./lib/portalAccess";

const portalValidator = v.literal("vendor");

function portalForRole(role: "student" | "vendor" | "admin" | "super_admin") {
  if (role === "vendor") return "vendor" as const;
  return null;
}

export const status = query({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    const portal = portalForRole(current.profile.role);
    const expiresAt = current.profile.portalAccessExpiresAt ?? 0;
    return {
      portal,
      required: portal !== null,
      active: portal === null || expiresAt > Date.now(),
      expiresAt: expiresAt || null,
      vendorCodeIssued:
        current.profile.role === "vendor" &&
        Boolean(current.profile.vendorLoginCodeHash),
      lockedUntil: current.profile.portalLockedUntil ?? null,
    };
  },
});

export const verify = mutation({
  args: { portal: portalValidator, code: v.string() },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    const expectedPortal = portalForRole(current.profile.role);
    if (expectedPortal !== args.portal) {
      throw new ConvexError(`This account is not registered as a ${args.portal}.`);
    }

    const now = Date.now();
    if ((current.profile.portalLockedUntil ?? 0) > now) {
      throw new ConvexError(
        "Too many incorrect codes. Try again after the 15-minute security lock."
      );
    }

    const code = args.code.trim();
    const expectedHash = current.profile.vendorLoginCodeHash;
    const pepper = portalCodePepper();
    if (!expectedHash) {
      throw new ConvexError(
        "Your vendor login code has not been issued. Ask an administrator to regenerate it."
      );
    }

    const providedHash = isSixDigitCode(code)
      ? await hashPortalCode({ code, userId: current.userId, pepper })
      : "";
    if (!providedHash || !secureHashEqual(providedHash, expectedHash)) {
      const failedAttempts = (current.profile.portalFailedAttempts ?? 0) + 1;
      const locked = failedAttempts >= MAX_PORTAL_ATTEMPTS;
      await ctx.db.patch(current.profile._id, {
        portalFailedAttempts: locked ? 0 : failedAttempts,
        portalLockedUntil: locked ? now + PORTAL_LOCK_DURATION_MS : undefined,
        portalAccessExpiresAt: undefined,
      });
      throw new ConvexError(
        locked
          ? "Too many incorrect codes. Portal access is locked for 15 minutes."
          : "The six-digit portal code is incorrect."
      );
    }

    const expiresAt = now + PORTAL_ACCESS_DURATION_MS;
    await ctx.db.patch(current.profile._id, {
      portalAccessExpiresAt: expiresAt,
      portalFailedAttempts: 0,
      portalLockedUntil: undefined,
    });
    await recordAudit(ctx, current, {
      action: "vendor_portal_login",
      targetType: "portal_access",
      details: "vendor portal authorization granted for 8 hours",
    });
    return { expiresAt };
  },
});

export const revokeCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    await ctx.db.patch(current.profile._id, { portalAccessExpiresAt: undefined });
  },
});

export const regenerateVendorCode = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const vendor = await ctx.db.get(args.userId);
    if (!vendor || vendor.role !== "vendor") {
      throw new ConvexError("Vendor account not found.");
    }

    const loginCode = generateSixDigitCode();
    const vendorLoginCodeHash = await hashPortalCode({
      code: loginCode,
      userId: vendor.authUserId,
      pepper: portalCodePepper(),
    });
    await ctx.db.patch(vendor._id, {
      vendorLoginCodeHash,
      vendorLoginCodeIssuedAt: Date.now(),
      portalAccessExpiresAt: undefined,
      portalFailedAttempts: 0,
      portalLockedUntil: undefined,
    });
    await recordAudit(ctx, admin, {
      action: "vendor_login_code_regenerated",
      targetType: "user",
      targetId: vendor._id,
      details: `Regenerated the vendor login code for ${vendor.email}`,
    });
    return { loginCode, vendorName: vendor.name, vendorEmail: vendor.email };
  },
});
