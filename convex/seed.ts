import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const outlets = [
  {
    name: "Spice Junction",
    slug: "spice-junction",
    description:
      "Authentic North Indian cuisine with a modern twist. Famous for butter chicken, biryani, and fresh naan.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop",
    location: "Main Canteen, Ground Floor",
    rating: 4.6,
    reviewCount: 342,
    isOpen: true,
    operatingHours: { open: "08:00", close: "21:00" },
    tags: ["North Indian", "Biryani", "Thali"],
    avgPrepTime: 12,
    vendorId: "demo-vendor-spice",
    status: "active" as const,
    commissionRate: 8,
    contactEmail: "spice@swifttray.test",
  },
  {
    name: "Dragon Bowl",
    slug: "dragon-bowl",
    description:
      "Quick Indo-Chinese bowls, noodles, fried rice, and crispy Manchurian for busy campus days.",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop",
    location: "Food Court, 1st Floor",
    rating: 4.3,
    reviewCount: 218,
    isOpen: true,
    operatingHours: { open: "09:00", close: "22:00" },
    tags: ["Chinese", "Fast Food", "Noodles"],
    avgPrepTime: 10,
    vendorId: "demo-vendor-dragon",
    status: "active" as const,
    commissionRate: 8,
    contactEmail: "dragon@swifttray.test",
  },
  {
    name: "South Express",
    slug: "south-express",
    description:
      "Traditional South Indian breakfast and meals made fresh with crisp dosas, idlis, and filter coffee.",
    image:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop",
    location: "Hostel Block A, Ground Floor",
    rating: 4.8,
    reviewCount: 456,
    isOpen: true,
    operatingHours: { open: "07:00", close: "20:00" },
    tags: ["South Indian", "Breakfast", "Healthy"],
    avgPrepTime: 8,
    vendorId: "demo-vendor-south",
    status: "active" as const,
    commissionRate: 7,
    contactEmail: "south@swifttray.test",
  },
];

const menuItems = [
  {
    outletSlug: "spice-junction",
    name: "Butter Chicken",
    description:
      "Tender chicken in rich, creamy tomato gravy with aromatic spices.",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
    category: "lunch",
    isAvailable: true,
    prepTime: 15,
    nutrition: {
      calories: 450,
      protein: "28g",
      carbs: "12g",
      fat: "32g",
      allergens: ["dairy", "gluten"],
    },
    customizations: [
      {
        name: "Spice Level",
        options: [
          { label: "Mild", price: 0 },
          { label: "Medium", price: 0 },
          { label: "Hot", price: 0 },
        ],
        required: true,
        maxSelect: 1,
      },
    ],
    tags: ["Bestseller", "Non-Veg"],
    orderCount: 1250,
  },
  {
    outletSlug: "spice-junction",
    name: "Paneer Tikka",
    description: "Marinated cottage cheese cubes grilled with peppers and onions.",
    price: 150,
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop",
    category: "snacks",
    isAvailable: true,
    prepTime: 12,
    nutrition: { calories: 320, protein: "18g", carbs: "8g", fat: "24g" },
    customizations: [],
    tags: ["Popular", "Veg"],
    orderCount: 890,
  },
  {
    outletSlug: "spice-junction",
    name: "Hyderabadi Biryani",
    description: "Fragrant basmati rice layered with spiced chicken and herbs.",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
    category: "biryani",
    isAvailable: true,
    prepTime: 20,
    nutrition: { calories: 650, protein: "35g", carbs: "75g", fat: "22g" },
    customizations: [],
    tags: ["Bestseller", "Non-Veg"],
    orderCount: 1580,
  },
  {
    outletSlug: "dragon-bowl",
    name: "Hakka Noodles",
    description: "Stir-fried noodles with vegetables, soy sauce, and chili.",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    category: "chinese",
    isAvailable: true,
    prepTime: 10,
    nutrition: { calories: 380, protein: "8g", carbs: "55g", fat: "14g" },
    customizations: [],
    tags: ["Popular", "Quick"],
    orderCount: 1100,
  },
  {
    outletSlug: "dragon-bowl",
    name: "Manchurian",
    description: "Crispy vegetable balls tossed in spicy Indo-Chinese sauce.",
    price: 100,
    image:
      "https://images.unsplash.com/photo-1645696301019-35adcc18fc94?w=400&h=300&fit=crop",
    category: "chinese",
    isAvailable: true,
    prepTime: 12,
    nutrition: { calories: 290, protein: "6g", carbs: "38g", fat: "14g" },
    customizations: [],
    tags: ["Bestseller", "Veg"],
    orderCount: 920,
  },
  {
    outletSlug: "south-express",
    name: "Masala Dosa",
    description: "Crisp dosa filled with spiced potato masala.",
    price: 70,
    image:
      "https://images.unsplash.com/photo-1668236543090-82eb5eace6d8?w=400&h=300&fit=crop",
    category: "south-indian",
    isAvailable: true,
    prepTime: 8,
    nutrition: { calories: 280, protein: "8g", carbs: "45g", fat: "8g" },
    customizations: [],
    tags: ["Bestseller", "Veg", "Breakfast"],
    orderCount: 2100,
  },
  {
    outletSlug: "south-express",
    name: "Idli Sambar",
    description: "Fluffy steamed rice cakes with sambar and coconut chutney.",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
    category: "south-indian",
    isAvailable: true,
    prepTime: 5,
    nutrition: { calories: 180, protein: "6g", carbs: "32g", fat: "3g" },
    customizations: [],
    tags: ["Veg", "Breakfast", "Light"],
    orderCount: 1750,
  },
];

export const demo = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("outlets").first();
    if (existing) {
      return { seeded: false, message: "Demo data already exists." };
    }

    const outletIds = new Map<string, Id<"outlets">>();

    for (const outlet of outlets) {
      const id = await ctx.db.insert("outlets", outlet);
      outletIds.set(outlet.slug, id);
    }

    for (const item of menuItems) {
      const { outletSlug, ...menuItem } = item;
      const outletId = outletIds.get(outletSlug);
      if (!outletId) continue;

      await ctx.db.insert("menuItems", {
        ...menuItem,
        outletId,
      });
    }

    return { seeded: true, message: "Demo outlets and menus seeded." };
  },
});
