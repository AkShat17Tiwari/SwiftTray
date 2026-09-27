import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireProfile } from "./lib/auth";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(args.limit || 50);
    return logs;
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    if (current.userId !== args.userId) await requireAdmin(ctx);
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const listByAction = query({
  args: { action: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_action", (q) => q.eq("action", args.action))
      .order("desc")
      .take(50);
  },
});
