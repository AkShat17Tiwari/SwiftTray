import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByOutlet = query({
  args: {
    outletId: v.id("outlets"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items;

    if (args.category) {
      items = await ctx.db
        .query("menuItems")
        .withIndex("by_outletId_category", (q) =>
          q.eq("outletId", args.outletId).eq("category", args.category!)
        )
        .collect();
    } else {
      items = await ctx.db
        .query("menuItems")
        .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
        .collect();
    }

    return items;
  },
});

export const getById = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTrending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_isAvailable", (q) => q.eq("isAvailable", true))
      .collect();

    return items
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, args.limit || 6);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.toLowerCase();
    const items = await ctx.db.query("menuItems").collect();

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  },
});

export const create = mutation({
  args: {
    outletId: v.id("outlets"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.string(),
    category: v.string(),
    prepTime: v.number(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      ...args,
      isAvailable: true,
      nutrition: undefined,
      customizations: [],
      orderCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    image: v.optional(v.string()),
    category: v.optional(v.string()),
    prepTime: v.optional(v.number()),
    isAvailable: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");
    await ctx.db.patch(args.id, { isAvailable: !item.isAvailable });
  },
});
