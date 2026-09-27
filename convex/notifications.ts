import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireProfile } from "./lib/auth";

export const getForUser = query({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", current.userId))
      .order("desc")
      .take(20);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) =>
        q.eq("userId", current.userId).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const current = await requireProfile(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== current.userId) {
      throw new ConvexError("Notification not found.");
    }
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const current = await requireProfile(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) =>
        q.eq("userId", current.userId).eq("isRead", false)
      )
      .collect();

    for (const notif of unread) {
      await ctx.db.patch(notif._id, { isRead: true });
    }
  },
});
