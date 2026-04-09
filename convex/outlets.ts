import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    search: v.optional(v.string()),
    openOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let outlets;

    if (args.openOnly) {
      outlets = await ctx.db
        .query("outlets")
        .withIndex("by_isOpen", (q) => q.eq("isOpen", true))
        .collect();
    } else {
      outlets = await ctx.db.query("outlets").collect();
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      outlets = outlets.filter(
        (o) =>
          o.name.toLowerCase().includes(search) ||
          o.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    return outlets;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("outlets")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("outlets")
      .withIndex("by_isOpen", (q) => q.eq("isOpen", true))
      .take(4);
  },
});

export const toggleAvailability = mutation({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    const outlet = await ctx.db.get(args.outletId);
    if (!outlet) throw new Error("Outlet not found");
    await ctx.db.patch(args.outletId, { isOpen: !outlet.isOpen });
  },
});
