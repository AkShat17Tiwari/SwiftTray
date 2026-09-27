import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/auth";

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
  {
    name: "Brew & Bite",
    slug: "brew-and-bite",
    description:
      "Cozy campus café serving barista coffee, cold brews, toasted sandwiches, and fresh-baked pastries.",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop",
    location: "Library Wing, Ground Floor",
    rating: 4.7,
    reviewCount: 389,
    isOpen: true,
    operatingHours: { open: "07:30", close: "22:00" },
    tags: ["Café", "Beverages", "Snacks"],
    avgPrepTime: 6,
    vendorId: "demo-vendor-brew",
    status: "active" as const,
    commissionRate: 7,
    contactEmail: "brew@swifttray.test",
  },
  {
    name: "Pizza Piazza",
    slug: "pizza-piazza",
    description:
      "Wood-fired pizzas, creamy pastas, and Italian classics made to order with fresh mozzarella and basil.",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=400&fit=crop",
    location: "Food Court, 1st Floor",
    rating: 4.5,
    reviewCount: 512,
    isOpen: true,
    operatingHours: { open: "11:00", close: "23:00" },
    tags: ["Italian", "Pizza", "Fast Food"],
    avgPrepTime: 18,
    vendorId: "demo-vendor-pizza",
    status: "active" as const,
    commissionRate: 9,
    contactEmail: "pizza@swifttray.test",
  },
  {
    name: "Burger Barn",
    slug: "burger-barn",
    description:
      "Juicy stacked burgers, loaded fries, and American-style comfort food grilled fresh all day.",
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&h=400&fit=crop",
    location: "Sports Complex, Ground Floor",
    rating: 4.4,
    reviewCount: 634,
    isOpen: true,
    operatingHours: { open: "11:00", close: "23:30" },
    tags: ["Burgers", "Fast Food", "American"],
    avgPrepTime: 14,
    vendorId: "demo-vendor-burger",
    status: "active" as const,
    commissionRate: 9,
    contactEmail: "burger@swifttray.test",
  },
  {
    name: "Green Bowl",
    slug: "green-bowl",
    description:
      "Wholesome salads, grain bowls, and cold-pressed smoothies for a fresh, healthy campus break.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop",
    location: "Wellness Center, 1st Floor",
    rating: 4.6,
    reviewCount: 271,
    isOpen: true,
    operatingHours: { open: "08:00", close: "20:00" },
    tags: ["Healthy", "Salads", "Vegan"],
    avgPrepTime: 9,
    vendorId: "demo-vendor-green",
    status: "active" as const,
    commissionRate: 7,
    contactEmail: "green@swifttray.test",
  },
  {
    name: "Sweet Tooth",
    slug: "sweet-tooth",
    description:
      "Decadent desserts, gooey brownies, artisan ice creams, and freshly baked cakes for your sugar fix.",
    image:
      "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop",
    coverImage:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=400&fit=crop",
    location: "Central Plaza, Ground Floor",
    rating: 4.9,
    reviewCount: 803,
    isOpen: true,
    operatingHours: { open: "10:00", close: "23:00" },
    tags: ["Desserts", "Bakery", "Ice Cream"],
    avgPrepTime: 5,
    vendorId: "demo-vendor-sweet",
    status: "active" as const,
    commissionRate: 8,
    contactEmail: "sweet@swifttray.test",
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
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop",
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
      "https://images.unsplash.com/photo-1743517894265-c86ab035adef?w=400&h=300&fit=crop",
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

  // ── Brew & Bite ─────────────────────────────────────────────
  {
    outletSlug: "brew-and-bite",
    name: "Cappuccino",
    description: "Rich espresso topped with velvety steamed milk foam.",
    price: 90,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
    category: "beverages",
    isAvailable: true,
    prepTime: 5,
    nutrition: { calories: 120, protein: "6g", carbs: "10g", fat: "6g" },
    customizations: [
      {
        name: "Size",
        options: [
          { label: "Regular", price: 0 },
          { label: "Large", price: 30 },
        ],
        required: true,
        maxSelect: 1,
      },
    ],
    tags: ["Bestseller", "Veg", "Hot"],
    orderCount: 1420,
  },
  {
    outletSlug: "brew-and-bite",
    name: "Cold Coffee",
    description: "Chilled blended coffee with milk, ice, and a hint of chocolate.",
    price: 110,
    image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop",
    category: "beverages",
    isAvailable: true,
    prepTime: 6,
    nutrition: { calories: 210, protein: "7g", carbs: "28g", fat: "8g" },
    customizations: [],
    tags: ["Popular", "Veg", "Cold"],
    orderCount: 1180,
  },
  {
    outletSlug: "brew-and-bite",
    name: "Grilled Veg Sandwich",
    description: "Toasted sandwich stuffed with veggies, cheese, and mint chutney.",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop",
    category: "snacks",
    isAvailable: true,
    prepTime: 8,
    nutrition: { calories: 340, protein: "12g", carbs: "42g", fat: "14g" },
    customizations: [],
    tags: ["Veg", "Quick"],
    orderCount: 760,
  },
  {
    outletSlug: "brew-and-bite",
    name: "Butter Croissant",
    description: "Flaky, buttery French croissant baked fresh every morning.",
    price: 80,
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
    category: "snacks",
    isAvailable: true,
    prepTime: 3,
    nutrition: { calories: 270, protein: "5g", carbs: "31g", fat: "14g" },
    customizations: [],
    tags: ["Veg", "Bakery"],
    orderCount: 540,
  },

  // ── Pizza Piazza ────────────────────────────────────────────
  {
    outletSlug: "pizza-piazza",
    name: "Margherita Pizza",
    description: "Classic thin-crust pizza with tomato, fresh mozzarella, and basil.",
    price: 200,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    category: "fast-food",
    isAvailable: true,
    prepTime: 18,
    nutrition: { calories: 560, protein: "22g", carbs: "68g", fat: "22g" },
    customizations: [
      {
        name: "Crust",
        options: [
          { label: "Thin Crust", price: 0 },
          { label: "Cheese Burst", price: 60 },
        ],
        required: true,
        maxSelect: 1,
      },
    ],
    tags: ["Bestseller", "Veg"],
    orderCount: 1640,
  },
  {
    outletSlug: "pizza-piazza",
    name: "Farmhouse Pizza",
    description: "Loaded with onion, capsicum, mushroom, tomato, and extra cheese.",
    price: 260,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    category: "fast-food",
    isAvailable: true,
    prepTime: 20,
    nutrition: { calories: 680, protein: "26g", carbs: "74g", fat: "30g" },
    customizations: [],
    tags: ["Popular", "Veg"],
    orderCount: 1210,
  },
  {
    outletSlug: "pizza-piazza",
    name: "Creamy Herb Risotto",
    description: "Slow-cooked Arborio rice in a creamy parmesan and herb sauce.",
    price: 190,
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    category: "fast-food",
    isAvailable: true,
    prepTime: 16,
    nutrition: { calories: 520, protein: "14g", carbs: "62g", fat: "24g" },
    customizations: [],
    tags: ["Veg", "Italian"],
    orderCount: 430,
  },

  // ── Burger Barn ─────────────────────────────────────────────
  {
    outletSlug: "burger-barn",
    name: "Classic Veg Burger",
    description: "Crispy veg patty, lettuce, tomato, and house sauce in a toasted bun.",
    price: 130,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "fast-food",
    isAvailable: true,
    prepTime: 12,
    nutrition: { calories: 480, protein: "15g", carbs: "52g", fat: "22g" },
    customizations: [
      {
        name: "Add-ons",
        options: [
          { label: "Extra Cheese", price: 25 },
          { label: "Extra Patty", price: 40 },
        ],
        required: false,
        maxSelect: 2,
      },
    ],
    tags: ["Bestseller", "Veg"],
    orderCount: 1890,
  },
  {
    outletSlug: "burger-barn",
    name: "Double Cheese Burger",
    description: "Two grilled patties with melted cheddar, onions, and smoky sauce.",
    price: 170,
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
    category: "fast-food",
    isAvailable: true,
    prepTime: 14,
    nutrition: { calories: 720, protein: "34g", carbs: "48g", fat: "42g" },
    customizations: [],
    tags: ["Popular", "Non-Veg"],
    orderCount: 1350,
  },
  {
    outletSlug: "burger-barn",
    name: "Loaded Cheese Fries",
    description: "Crispy fries smothered in melted cheese, herbs, and jalapeños.",
    price: 100,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop",
    category: "snacks",
    isAvailable: true,
    prepTime: 10,
    nutrition: { calories: 420, protein: "10g", carbs: "48g", fat: "22g" },
    customizations: [],
    tags: ["Veg", "Shareable"],
    orderCount: 1620,
  },

  // ── Green Bowl ──────────────────────────────────────────────
  {
    outletSlug: "green-bowl",
    name: "Buddha Bowl",
    description: "Quinoa, chickpeas, avocado, and roasted veggies with tahini drizzle.",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    category: "healthy",
    isAvailable: true,
    prepTime: 10,
    nutrition: { calories: 420, protein: "18g", carbs: "52g", fat: "16g" },
    customizations: [],
    tags: ["Bestseller", "Vegan", "Healthy"],
    orderCount: 980,
  },
  {
    outletSlug: "green-bowl",
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan, croutons, and creamy caesar dressing.",
    price: 150,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    category: "healthy",
    isAvailable: true,
    prepTime: 8,
    nutrition: { calories: 320, protein: "12g", carbs: "18g", fat: "22g" },
    customizations: [],
    tags: ["Veg", "Healthy"],
    orderCount: 720,
  },
  {
    outletSlug: "green-bowl",
    name: "Berry Smoothie",
    description: "Blended mixed berries, banana, and yogurt for a refreshing boost.",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
    category: "beverages",
    isAvailable: true,
    prepTime: 5,
    nutrition: { calories: 240, protein: "8g", carbs: "44g", fat: "4g" },
    customizations: [],
    tags: ["Veg", "Cold", "Healthy"],
    orderCount: 860,
  },

  // ── Sweet Tooth ─────────────────────────────────────────────
  {
    outletSlug: "sweet-tooth",
    name: "Chocolate Lava Cake",
    description: "Warm molten chocolate cake with a gooey center, served with cream.",
    price: 140,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    category: "desserts",
    isAvailable: true,
    prepTime: 8,
    nutrition: { calories: 480, protein: "7g", carbs: "58g", fat: "26g" },
    customizations: [],
    tags: ["Bestseller", "Veg"],
    orderCount: 1510,
  },
  {
    outletSlug: "sweet-tooth",
    name: "Fudge Brownie",
    description: "Dense, chewy chocolate brownie with a crackly top and walnuts.",
    price: 100,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
    category: "desserts",
    isAvailable: true,
    prepTime: 4,
    nutrition: { calories: 360, protein: "5g", carbs: "44g", fat: "20g" },
    customizations: [],
    tags: ["Popular", "Veg"],
    orderCount: 1240,
  },
  {
    outletSlug: "sweet-tooth",
    name: "Vanilla Ice Cream",
    description: "Creamy artisan vanilla-bean ice cream in a crisp waffle cone.",
    price: 90,
    image:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop",
    category: "desserts",
    isAvailable: true,
    prepTime: 3,
    nutrition: { calories: 280, protein: "5g", carbs: "32g", fat: "15g" },
    customizations: [
      {
        name: "Scoops",
        options: [
          { label: "Single", price: 0 },
          { label: "Double", price: 40 },
        ],
        required: true,
        maxSelect: 1,
      },
    ],
    tags: ["Veg", "Cold"],
    orderCount: 1080,
  },
];

export const demo = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    let outletsAdded = 0;
    let dishesAdded = 0;
    let imagesFixed = 0;

    const outletIds = new Map<string, Id<"outlets">>();

    // Upsert outlets by slug — insert only the ones that don't exist yet.
    for (const outlet of outlets) {
      const existing = await ctx.db
        .query("outlets")
        .withIndex("by_slug", (q) => q.eq("slug", outlet.slug))
        .unique();
      if (existing) {
        outletIds.set(outlet.slug, existing._id);
      } else {
        const id = await ctx.db.insert("outlets", outlet);
        outletIds.set(outlet.slug, id);
        outletsAdded++;
      }
    }

    // Upsert menu items by (outlet, name). New dishes are inserted; existing
    // ones only get their image refreshed (so broken image URLs are healed
    // without clobbering live fields like orderCount).
    for (const item of menuItems) {
      const { outletSlug, ...menuItem } = item;
      const outletId = outletIds.get(outletSlug);
      if (!outletId) continue;

      const siblings = await ctx.db
        .query("menuItems")
        .withIndex("by_outletId", (q) => q.eq("outletId", outletId))
        .collect();
      const existing = siblings.find((m) => m.name === menuItem.name);

      if (existing) {
        if (existing.image !== menuItem.image) {
          await ctx.db.patch(existing._id, { image: menuItem.image });
          imagesFixed++;
        }
      } else {
        await ctx.db.insert("menuItems", { ...menuItem, outletId });
        dishesAdded++;
      }
    }

    return {
      seeded: outletsAdded > 0 || dishesAdded > 0 || imagesFixed > 0,
      outletsAdded,
      dishesAdded,
      imagesFixed,
      message:
        outletsAdded === 0 && dishesAdded === 0 && imagesFixed === 0
          ? "Everything already up to date."
          : `Added ${outletsAdded} outlets and ${dishesAdded} dishes` +
            (imagesFixed > 0 ? `, fixed ${imagesFixed} images.` : "."),
    };
  },
});
