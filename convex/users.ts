import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      phone: undefined,
      role: "student",
      status: "active",
      avatarUrl: args.avatarUrl,
      favoriteOutlets: [],
      preferences: {},
    });
  },
});

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const listByRole = query({
  args: {
    role: v.union(
      v.literal("student"),
      v.literal("vendor"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("student"),
      v.literal("vendor"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("pending_approval")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { status: args.status });
  },
});

export const assignOutlet = mutation({
  args: {
    userId: v.id("users"),
    outletId: v.id("outlets"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      assignedOutletId: args.outletId,
      role: "vendor",
    });
  },
});

export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    phone: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        dietary: v.optional(v.array(v.string())),
        defaultPickupNotes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const updates: Record<string, unknown> = {};
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.preferences !== undefined) updates.preferences = args.preferences;

    await ctx.db.patch(user._id, updates);
  },
});

export const toggleFavoriteOutlet = mutation({
  args: {
    clerkId: v.string(),
    outletId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const favorites = user.favoriteOutlets;
    const index = favorites.indexOf(args.outletId);

    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(args.outletId);
    }

    await ctx.db.patch(user._id, { favoriteOutlets: favorites });
  },
});
