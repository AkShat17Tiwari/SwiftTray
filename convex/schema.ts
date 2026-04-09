import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================
  // Users
  // ============================================================
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("student"),
      v.literal("vendor"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("pending_approval")
    ),
    avatarUrl: v.optional(v.string()),
    assignedOutletId: v.optional(v.id("outlets")),
    favoriteOutlets: v.array(v.string()),
    preferences: v.object({
      dietary: v.optional(v.array(v.string())),
      defaultPickupNotes: v.optional(v.string()),
    }),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  // ============================================================
  // Outlets
  // ============================================================
  outlets: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    image: v.string(),
    coverImage: v.string(),
    location: v.string(),
    rating: v.number(),
    reviewCount: v.number(),
    isOpen: v.boolean(),
    operatingHours: v.object({
      open: v.string(),
      close: v.string(),
    }),
    tags: v.array(v.string()),
    avgPrepTime: v.number(),
    vendorId: v.optional(v.string()),
    // Multi-tenant extensions
    commissionRate: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("pending")
    ),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_isOpen", ["isOpen"])
    .index("by_vendorId", ["vendorId"])
    .index("by_status", ["status"]),

  // ============================================================
  // Menu Items
  // ============================================================
  menuItems: defineTable({
    outletId: v.id("outlets"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.string(),
    category: v.string(),
    isAvailable: v.boolean(),
    prepTime: v.number(),
    nutrition: v.optional(
      v.object({
        calories: v.optional(v.number()),
        protein: v.optional(v.string()),
        carbs: v.optional(v.string()),
        fat: v.optional(v.string()),
        allergens: v.optional(v.array(v.string())),
      })
    ),
    customizations: v.array(
      v.object({
        name: v.string(),
        options: v.array(
          v.object({
            label: v.string(),
            price: v.number(),
          })
        ),
        required: v.boolean(),
        maxSelect: v.number(),
      })
    ),
    tags: v.array(v.string()),
    orderCount: v.number(),
  })
    .index("by_outletId", ["outletId"])
    .index("by_category", ["category"])
    .index("by_outletId_category", ["outletId", "category"])
    .index("by_isAvailable", ["isAvailable"]),

  // ============================================================
  // Carts
  // ============================================================
  carts: defineTable({
    userId: v.string(),
    outletId: v.id("outlets"),
    outletName: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.string(),
        customizations: v.array(
          v.object({
            name: v.string(),
            selected: v.string(),
            price: v.number(),
          })
        ),
        specialInstructions: v.optional(v.string()),
      })
    ),
    totalAmount: v.number(),
  }).index("by_userId", ["userId"]),

  // ============================================================
  // Orders
  // ============================================================
  orders: defineTable({
    userId: v.string(),
    outletId: v.id("outlets"),
    outletName: v.string(),
    outletImage: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        customizations: v.array(
          v.object({
            name: v.string(),
            selected: v.string(),
            price: v.number(),
          })
        ),
      })
    ),
    subtotal: v.number(),
    tax: v.number(),
    discount: v.number(),
    totalAmount: v.number(),
    couponCode: v.optional(v.string()),
    status: v.union(
      v.literal("placed"),
      v.literal("accepted"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("picked_up"),
      v.literal("cancelled")
    ),
    statusHistory: v.array(
      v.object({
        status: v.string(),
        timestamp: v.number(),
        note: v.optional(v.string()),
      })
    ),
    pickupSlot: v.string(),
    pickupToken: v.string(),
    notes: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    estimatedReadyTime: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_outletId", ["outletId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_pickupToken", ["pickupToken"]),

  // ============================================================
  // Notifications
  // ============================================================
  notifications: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("order_update"),
      v.literal("promo"),
      v.literal("system"),
      v.literal("announcement")
    ),
    title: v.string(),
    message: v.string(),
    orderId: v.optional(v.id("orders")),
    isRead: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"]),

  // ============================================================
  // Coupons
  // ============================================================
  coupons: defineTable({
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("flat")),
    discountValue: v.number(),
    minOrder: v.number(),
    maxDiscount: v.number(),
    validUntil: v.number(),
    usageLimit: v.number(),
    usedCount: v.number(),
    outletId: v.optional(v.id("outlets")),
    isActive: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_isActive", ["isActive"]),

  // ============================================================
  // Reviews
  // ============================================================
  reviews: defineTable({
    userId: v.string(),
    userName: v.string(),
    outletId: v.id("outlets"),
    orderId: v.id("orders"),
    rating: v.number(),
    comment: v.string(),
  })
    .index("by_outletId", ["outletId"])
    .index("by_userId", ["userId"]),

  // ============================================================
  // Analytics Events
  // ============================================================
  analyticsEvents: defineTable({
    type: v.string(),
    outletId: v.optional(v.id("outlets")),
    userId: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    metadata: v.any(),
  })
    .index("by_type", ["type"])
    .index("by_outletId", ["outletId"]),

  // ============================================================
  // Vendor Assignments (Multi-tenant)
  // ============================================================
  vendorAssignments: defineTable({
    userId: v.string(),
    outletId: v.id("outlets"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("revoked")
    ),
    approvedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_outletId", ["outletId"])
    .index("by_status", ["status"]),

  // ============================================================
  // Audit Logs
  // ============================================================
  auditLogs: defineTable({
    userId: v.string(),
    userName: v.string(),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_userId", ["userId"])
    .index("by_action", ["action"]),

  // ============================================================
  // Support Tickets
  // ============================================================
  supportTickets: defineTable({
    userId: v.string(),
    userName: v.string(),
    outletId: v.optional(v.id("outlets")),
    orderId: v.optional(v.id("orders")),
    subject: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assignedTo: v.optional(v.string()),
    resolution: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_outletId", ["outletId"]),

  // ============================================================
  // Announcements
  // ============================================================
  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("promotion"),
      v.literal("maintenance")
    ),
    isActive: v.boolean(),
    targetRole: v.union(
      v.literal("all"),
      v.literal("student"),
      v.literal("vendor")
    ),
    createdBy: v.string(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_isActive", ["isActive"])
    .index("by_targetRole", ["targetRole"]),

  // ============================================================
  // Vendor Portal Keys (per-outlet access keys)
  // ============================================================
  vendorPortalKeys: defineTable({
    outletId: v.id("outlets"),
    vendorUserId: v.string(),
    key: v.string(),
    isActive: v.boolean(),
    lastUsedAt: v.optional(v.number()),
    rotatedAt: v.optional(v.number()),
  })
    .index("by_key", ["key"])
    .index("by_outletId", ["outletId"])
    .index("by_vendorUserId", ["vendorUserId"]),

  // ============================================================
  // Security Events (access key audit trail)
  // ============================================================
  securityEvents: defineTable({
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    eventType: v.union(
      v.literal("admin_key_success"),
      v.literal("admin_key_failure"),
      v.literal("vendor_key_success"),
      v.literal("vendor_key_failure"),
      v.literal("brute_force_lockout"),
      v.literal("key_rotated"),
      v.literal("key_revoked"),
      v.literal("session_expired")
    ),
    portalType: v.union(v.literal("admin"), v.literal("vendor")),
    outletId: v.optional(v.id("outlets")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    details: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_eventType", ["eventType"])
    .index("by_portalType", ["portalType"]),
});
