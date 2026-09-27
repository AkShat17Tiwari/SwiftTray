import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireAdmin, requireVendorForOutlet } from "./lib/auth";

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

    return outlets.filter((outlet) => outlet.status === "active");
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const outlet = await ctx.db
      .query("outlets")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return outlet?.status === "active" ? outlet : null;
  },
});

export const getById = query({
  args: { id: v.id("outlets") },
  handler: async (ctx, args) => {
    const outlet = await ctx.db.get(args.id);
    return outlet?.status === "active" ? outlet : null;
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const outlets = await ctx.db
      .query("outlets")
      .withIndex("by_isOpen", (q) => q.eq("isOpen", true))
      .collect();
    return outlets.filter((outlet) => outlet.status === "active").slice(0, 4);
  },
});

export const toggleAvailability = mutation({
  args: { outletId: v.id("outlets") },
  handler: async (ctx, args) => {
    await requireVendorForOutlet(ctx, args.outletId);
    const outlet = await ctx.db.get(args.outletId);
    if (!outlet) throw new Error("Outlet not found");
    await ctx.db.patch(args.outletId, { isOpen: !outlet.isOpen });
  },
});

export const updateSettings = mutation({
  args: {
    outletId: v.id("outlets"),
    name: v.string(),
    location: v.string(),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    open: v.string(),
    close: v.string(),
  },
  handler: async (ctx, args) => {
    await requireVendorForOutlet(ctx, args.outletId);
    const outlet = await ctx.db.get(args.outletId);
    if (!outlet) throw new ConvexError("Outlet not found.");
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (
      args.name.trim().length < 2 ||
      args.name.length > 100 ||
      args.location.trim().length < 2 ||
      args.location.length > 160 ||
      !timePattern.test(args.open) ||
      !timePattern.test(args.close)
    ) {
      throw new ConvexError("Enter valid outlet details and operating hours.");
    }
    if (args.contactEmail && !/^\S+@\S+\.\S+$/.test(args.contactEmail)) {
      throw new ConvexError("Enter a valid contact email.");
    }
    await ctx.db.patch(args.outletId, {
      name: args.name.trim(),
      location: args.location.trim(),
      contactEmail: args.contactEmail?.trim().toLowerCase() || undefined,
      contactPhone: args.contactPhone?.trim().slice(0, 30) || undefined,
      operatingHours: { open: args.open, close: args.close },
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("outlets").collect();
  },
});
