import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getOptionalProfile, recordAudit, requireAdmin } from "./lib/auth";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("promotion"),
      v.literal("maintenance")
    ),
    targetRole: v.union(
      v.literal("all"),
      v.literal("student"),
      v.literal("vendor")
    ),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (args.title.trim().length < 4 || args.title.length > 120 || args.content.trim().length < 10 || args.content.length > 1000) {
      throw new ConvexError("Enter a valid title and message.");
    }
    const id = await ctx.db.insert("announcements", {
      ...args,
      title: args.title.trim(),
      content: args.content.trim(),
      createdBy: admin.userId,
      isActive: true,
    });
    await recordAudit(ctx, admin, { action: "created_announcement", targetType: "announcement", targetId: String(id), details: args.title.trim() });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("announcements"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const announcement = await ctx.db.get(args.id);
    if (!announcement) throw new ConvexError("Announcement not found.");
    if (args.title !== undefined && (args.title.trim().length < 4 || args.title.length > 120)) throw new ConvexError("Enter a valid title.");
    if (args.content !== undefined && (args.content.trim().length < 10 || args.content.length > 1000)) throw new ConvexError("Enter a valid message.");
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
    await recordAudit(ctx, admin, { action: "updated_announcement", targetType: "announcement", targetId: String(id), details: announcement.title });
  },
});

export const remove = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const announcement = await ctx.db.get(args.id);
    if (!announcement) throw new ConvexError("Announcement not found.");
    await ctx.db.delete(args.id);
    await recordAudit(ctx, admin, { action: "deleted_announcement", targetType: "announcement", targetId: String(args.id), details: announcement.title });
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const current = await getOptionalProfile(ctx);
    const role = current?.profile.role ?? "student";
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
    return announcements.filter(
      (announcement) =>
        (!announcement.expiresAt || announcement.expiresAt > Date.now()) &&
        (announcement.targetRole === "all" || announcement.targetRole === role)
    );
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("announcements").order("desc").collect();
  },
});
