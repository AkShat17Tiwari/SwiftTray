import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { requireVendorForOutlet } from "./lib/auth";

function isSupportedImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

export const listByOutlet = query({
  args: {
    outletId: v.id("outlets"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const outlet = await ctx.db.get(args.outletId);
    if (!outlet || outlet.status !== "active") return [];
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

    return items.filter((item) => item.isAvailable);
  },
});

export const getById = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item?.isAvailable) return null;
    const outlet = await ctx.db.get(item.outletId);
    return outlet?.status === "active" ? item : null;
  },
});

export const getTrending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_isAvailable", (q) => q.eq("isAvailable", true))
      .collect();

    const activeItems = [];
    for (const item of items) {
      const outlet = await ctx.db.get(item.outletId);
      if (outlet?.status === "active") activeItems.push(item);
    }
    return activeItems
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, args.limit || 6);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.toLowerCase();
    const items = await ctx.db.query("menuItems").collect();

    const matches = items.filter(
      (item) =>
        item.isAvailable &&
        (item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)))
    );
    const publicMatches = [];
    for (const item of matches) {
      const outlet = await ctx.db.get(item.outletId);
      if (outlet?.status === "active") publicMatches.push(item);
    }
    return publicMatches;
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
    await requireVendorForOutlet(ctx, args.outletId);
    if (
      args.name.trim().length < 2 ||
      args.name.length > 100 ||
      args.description.trim().length < 4 ||
      args.description.length > 500 ||
      args.category.trim().length < 2 ||
      args.category.length > 60 ||
      args.price <= 0 ||
      args.prepTime < 0 ||
      args.prepTime > 240 ||
      !isSupportedImageUrl(args.image) ||
      args.tags.length > 20
    ) {
      throw new ConvexError("Enter valid menu item details.");
    }
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
    const item = await ctx.db.get(args.id);
    if (!item) throw new ConvexError("Menu item not found.");
    await requireVendorForOutlet(ctx, item.outletId);
    if (args.price !== undefined && args.price <= 0) {
      throw new ConvexError("Price must be greater than zero.");
    }
    if (args.image !== undefined && !isSupportedImageUrl(args.image)) {
      throw new ConvexError("Use an HTTPS image from images.unsplash.com.");
    }
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
    const item = await ctx.db.get(args.id);
    if (!item) throw new ConvexError("Menu item not found.");
    await requireVendorForOutlet(ctx, item.outletId);
    await ctx.db.delete(args.id);
  },
});

export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");
    await requireVendorForOutlet(ctx, item.outletId);
    await ctx.db.patch(args.id, { isAvailable: !item.isAvailable });
  },
});

export const listForManagement = query({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    await requireVendorForOutlet(ctx, args.outletId);
    return await ctx.db
      .query("menuItems")
      .withIndex("by_outletId", (q) => q.eq("outletId", args.outletId))
      .collect();
  },
});
