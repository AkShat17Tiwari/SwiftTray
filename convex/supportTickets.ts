import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireProfile } from "./lib/auth";

const statusValidator = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("resolved"),
  v.literal("closed")
);
const priorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent")
);

export const create = mutation({
  args: {
    subject: v.string(),
    description: v.string(),
    priority: priorityValidator,
    outletId: v.optional(v.id("outlets")),
    orderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    if (args.subject.trim().length < 4 || args.subject.length > 120) {
      throw new ConvexError("Enter a subject between 4 and 120 characters.");
    }
    if (args.description.trim().length < 10 || args.description.length > 2_000) {
      throw new ConvexError("Enter a description between 10 and 2,000 characters.");
    }
    if (args.orderId) {
      const order = await ctx.db.get(args.orderId);
      if (!order || order.userId !== current.userId) {
        throw new ConvexError("Order not found.");
      }
    }
    return await ctx.db.insert("supportTickets", {
      ...args,
      subject: args.subject.trim(),
      description: args.description.trim(),
      userId: current.userId,
      userName: current.profile.name,
      status: "open",
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    return await ctx.db
      .query("supportTickets")
      .withIndex("by_userId", (q) => q.eq("userId", current.userId))
      .order("desc")
      .collect();
  },
});

export const listAll = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return args.status
      ? await ctx.db
          .query("supportTickets")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("supportTickets").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("supportTickets"),
    status: statusValidator,
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const ticket = await ctx.db.get(args.id);
    if (!ticket) throw new ConvexError("Ticket not found.");
    if (["resolved", "closed"].includes(args.status) && !args.resolution?.trim()) {
      throw new ConvexError("Add a resolution before resolving this ticket.");
    }
    await ctx.db.patch(args.id, {
      status: args.status,
      assignedTo: admin.userId,
      resolution: args.resolution?.trim().slice(0, 2_000) || ticket.resolution,
    });
  },
});
