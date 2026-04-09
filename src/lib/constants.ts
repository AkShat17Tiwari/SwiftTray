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

export const STATS = [
  { label: "Meals Served", value: 50000, suffix: "+" },
  { label: "Campus Outlets", value: 12, suffix: "" },
  { label: "Avg Wait Time", value: 8, suffix: " min" },
  { label: "Happy Students", value: 15000, suffix: "+" },
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

export const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    department: "Computer Science, 3rd Year",
    avatar: "AM",
    rating: 5,
    comment: "SwiftTray has literally saved me 30 minutes every day. No more standing in long canteen queues during lunch rush!",
  },
  {
    name: "Priya Sharma",
    department: "MBA, 1st Year",
    avatar: "PS",
    rating: 5,
    comment: "The real-time tracking is amazing. I start walking to the outlet exactly when my food is ready. Perfect timing every time!",
  },
  {
    name: "Rahul Krishnan",
    department: "Mechanical Eng, 2nd Year",
    avatar: "RK",
    rating: 4,
    comment: "Great variety of outlets and the app is super smooth. The pickup slot feature is genius for tight schedules.",
  },
  {
    name: "Sneha Reddy",
    department: "Design, 4th Year",
    avatar: "SR",
    rating: 5,
    comment: "Love the UI and the whole experience. Reordering my favorites with one tap is so convenient. Best campus app!",
  },
  {
    name: "Vikram Singh",
    department: "Electronics, 3rd Year",
    avatar: "VS",
    rating: 5,
    comment: "The vendor panel is fantastic too. Our hostel canteen saw 40% more orders since joining SwiftTray.",
  },
  {
    name: "Ananya Iyer",
    department: "Biotechnology, 2nd Year",
    avatar: "AI",
    rating: 4,
    comment: "No more guessing if the outlet has my favorite dish. Real-time availability updates are a game changer.",
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
      "You can cancel your order anytime before the outlet starts preparing it (before 'Preparing' status). Once preparation begins, cancellation may not be possible.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support UPI (GPay, PhonePe, Paytm), debit/credit cards, net banking, and campus wallet. You can also pay at the counter if the outlet supports it.",
  },
  {
    question: "How accurate is the wait time?",
    answer:
      "Our ETA predictions are based on real-time data from the outlet, including current queue size and prep complexity. They're usually accurate within 2-3 minutes.",
  },
  {
    question: "Can vendors join SwiftTray?",
    answer:
      "Absolutely! Campus food outlets can sign up for a vendor account. You'll get a dedicated dashboard to manage orders, menu, stock, and view analytics.",
  },
] as const;
