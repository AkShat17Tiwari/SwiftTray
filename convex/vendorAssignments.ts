import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const request = mutation({
  args: {
    userId: v.string(),
    outletId: v.id("outlets"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for existing pending request
    const existing = await ctx.db
      .query("vendorAssignments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();

    if (existing) throw new Error("You already have a pending request");

    return await ctx.db.insert("vendorAssignments", {
      userId: args.userId,
      outletId: args.outletId,
      status: "pending",
      notes: args.notes,
    });
  },
});

export const approve = mutation({
  args: {
    assignmentId: v.id("vendorAssignments"),
    approvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    await ctx.db.patch(args.assignmentId, {
      status: "approved",
      approvedBy: args.approvedBy,
    });

    // Update user role and assign outlet
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", assignment.userId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        role: "vendor",
        status: "active",
        assignedOutletId: assignment.outletId,
      });
    }
  },
});

export const reject = mutation({
  args: {
    assignmentId: v.id("vendorAssignments"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    await ctx.db.patch(args.assignmentId, { status: "revoked" });

    // Remove vendor role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", assignment.userId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        role: "student",
        assignedOutletId: undefined,
      });
    }
  },
});

export const getByVendor = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vendorAssignments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("vendorAssignments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vendorAssignments").collect();
  },
});
