import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { recordAudit, requireAdmin, requireProfile } from "./lib/auth";
import {
  generateSixDigitCode,
  hashPortalCode,
  portalCodePepper,
} from "./lib/portalAccess";

export const request = mutation({
  args: {
    outletId: v.id("outlets"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    const outlet = await ctx.db.get(args.outletId);
    if (!outlet || outlet.status === "suspended") {
      throw new ConvexError("Outlet not found.");
    }
    // Check for existing pending request
    const existing = await ctx.db
      .query("vendorAssignments")
      .withIndex("by_userId", (q) => q.eq("userId", current.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();

    if (existing) throw new Error("You already have a pending request");

    return await ctx.db.insert("vendorAssignments", {
      userId: current.userId,
      outletId: args.outletId,
      status: "pending",
      notes: args.notes,
    });
  },
});

export const approve = mutation({
  args: {
    assignmentId: v.id("vendorAssignments"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.status !== "pending") {
      throw new ConvexError("Only pending requests can be approved.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", assignment.userId))
      .unique();
    if (!user) throw new ConvexError("Vendor account profile not found.");

    const loginCode = generateSixDigitCode();
    const vendorLoginCodeHash = await hashPortalCode({
      code: loginCode,
      userId: user.authUserId,
      pepper: portalCodePepper(),
    });
    await ctx.db.patch(args.assignmentId, {
      status: "approved",
      approvedBy: admin.userId,
    });
    await ctx.db.patch(user._id, {
      role: "vendor",
      status: "active",
      assignedOutletId: assignment.outletId,
      vendorLoginCodeHash,
      vendorLoginCodeIssuedAt: Date.now(),
      portalAccessExpiresAt: undefined,
      portalFailedAttempts: 0,
      portalLockedUntil: undefined,
    });
    await ctx.db.insert("notifications", {
      userId: user.authUserId,
      type: "system",
      title: "Vendor access approved",
      message:
        "Your six-digit vendor login code has been issued. Obtain it securely from the administrator who approved your request.",
      isRead: false,
    });
    await recordAudit(ctx, admin, {
      action: "vendor_access_approved",
      targetType: "user",
      targetId: user._id,
      details: `Approved ${user.email} for vendor access`,
    });
    return {
      loginCode,
      vendorName: user.name,
      vendorEmail: user.email,
    };
  },
});

export const reject = mutation({
  args: {
    assignmentId: v.id("vendorAssignments"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment || assignment.status !== "pending") {
      throw new ConvexError("Only pending requests can be rejected.");
    }
    await ctx.db.patch(args.assignmentId, {
      status: "rejected",
      notes: args.notes,
    });
  },
});

export const revoke = mutation({
  args: {
    assignmentId: v.id("vendorAssignments"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    await ctx.db.patch(args.assignmentId, { status: "revoked" });

    // Remove vendor role
    const user = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", assignment.userId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        role: "student",
        assignedOutletId: undefined,
        vendorLoginCodeHash: undefined,
        vendorLoginCodeIssuedAt: undefined,
        portalAccessExpiresAt: undefined,
        portalFailedAttempts: 0,
        portalLockedUntil: undefined,
      });
    }
  },
});

export const getByVendor = query({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    return await ctx.db
      .query("vendorAssignments")
      .withIndex("by_userId", (q) => q.eq("userId", current.userId))
      .collect();
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const assignments = await ctx.db
      .query("vendorAssignments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return await Promise.all(
      assignments.map(async (assignment) => {
        const [user, outlet] = await Promise.all([
          ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", assignment.userId))
            .unique(),
          ctx.db.get(assignment.outletId),
        ]);
        return {
          ...assignment,
          userName: user?.name ?? "Unknown user",
          userEmail: user?.email ?? "Unknown email",
          outletName: outlet?.name ?? "Unknown outlet",
        };
      })
    );
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("vendorAssignments").collect();
  },
});
