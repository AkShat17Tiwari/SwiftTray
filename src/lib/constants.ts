// ============================================================
// SwiftTray — Constants
// ============================================================

export const APP_NAME = "SwiftTray";
export const APP_TAGLINE = "Skip the Queue. Savor the Flavor.";
export const APP_DESCRIPTION =
  "Smart campus food ordering platform. Pre-order from multiple outlets, skip the queue, and track your order in real-time.";

export const TAX_RATE = 0.05; // 5% GST

export const ORDER_STATUSES = [
  { key: "placed", label: "Order Placed", icon: "📋", description: "Your order has been received" },
  { key: "accepted", label: "Accepted", icon: "✅", description: "The outlet has accepted your order" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳", description: "Your food is being prepared" },
  { key: "ready", label: "Ready", icon: "🔔", description: "Your order is ready for pickup!" },
  { key: "picked_up", label: "Picked Up", icon: "🎉", description: "Order complete. Enjoy your meal!" },
] as const;

export const FOOD_CATEGORIES = [
  { id: "all", label: "All", icon: "🍽️" },
  { id: "breakfast", label: "Breakfast", icon: "🥞" },
  { id: "lunch", label: "Lunch", icon: "🍛" },
  { id: "snacks", label: "Snacks", icon: "🍿" },
  { id: "beverages", label: "Beverages", icon: "☕" },
  { id: "desserts", label: "Desserts", icon: "🍰" },
  { id: "healthy", label: "Healthy", icon: "🥗" },
  { id: "fast-food", label: "Fast Food", icon: "🍔" },
  { id: "biryani", label: "Biryani", icon: "🍚" },
  { id: "chinese", label: "Chinese", icon: "🥡" },
  { id: "south-indian", label: "South Indian", icon: "🫓" },
  { id: "north-indian", label: "North Indian", icon: "🍲" },
] as const;

export const CUISINE_TAGS = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Continental",
  "Fast Food",
  "Healthy",
  "Desserts",
  "Beverages",
  "Biryani",
  "Street Food",
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/outlets", label: "Outlets" },
  { href: "/orders", label: "My Orders" },
] as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Browse & Choose",
    description: "Explore menus from multiple campus outlets. Filter by cuisine, price, or dietary preferences.",
    icon: "search",
  },
  {
    step: 2,
    title: "Customize & Order",
    description: "Add your favorites to cart, customize items, and pick your preferred pickup time.",
    icon: "shopping-cart",
  },
  {
    step: 3,
    title: "Track in Real-time",
    description: "Watch your order progress live — from accepted to preparing to ready for pickup.",
    icon: "clock",
  },
  {
    step: 4,
    title: "Pickup & Enjoy",
    description: "Get notified when your food is ready. Skip the queue with your pickup token!",
    icon: "check-circle",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "How does SwiftTray work?",
    answer:
      "SwiftTray lets you browse campus food outlets, pre-order meals, choose a pickup time, and track your order in real-time. When your food is ready, you'll get a notification with a pickup token — just show it at the counter and grab your meal!",
  },
  {
    question: "Is SwiftTray free to use?",
    answer:
      "Yes! SwiftTray is completely free for students. You only pay for the food you order. There are no hidden fees, service charges, or delivery fees since it's a pickup-only model.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "You can cancel an unpaid order before the outlet accepts it. Paid orders require a support request so an administrator can issue and verify the Razorpay refund.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "Online payments use Razorpay Checkout, which can present UPI, supported cards, net banking, and wallets depending on the merchant account configuration.",
  },
  {
    question: "How accurate is the wait time?",
    answer:
      "The outlet provides its average preparation time and can add an estimated ready time after accepting a paid order. Treat it as an estimate during busy periods.",
  },
  {
    question: "Can vendors join SwiftTray?",
    answer:
      "Absolutely! Campus food outlets can sign up for a vendor account. You'll get a dedicated dashboard to manage orders, menu, stock, and view analytics.",
  },
] as const;
