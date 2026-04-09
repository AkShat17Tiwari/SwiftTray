// ============================================================
// SwiftTray — Type Definitions
// ============================================================

export type OrderStatus = 
  | "placed" 
  | "accepted" 
  | "preparing" 
  | "ready" 
  | "picked_up" 
  | "cancelled";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type DiscountType = "percentage" | "flat";
export type UserRole = "student" | "vendor" | "admin";
export type NotificationType = "order_update" | "promo" | "system";

export interface User {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  favoriteOutlets: string[];
  preferences: {
    dietary?: string[];
    defaultPickupNotes?: string;
  };
  _creationTime: number;
}

export interface Outlet {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  coverImage: string;
  location: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  operatingHours: {
    open: string;
    close: string;
  };
  tags: string[];
  avgPrepTime: number;
  _creationTime: number;
}

export interface CustomizationOption {
  name: string;
  options: {
    label: string;
    price: number;
  }[];
  required: boolean;
  maxSelect: number;
}

export interface NutritionInfo {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  allergens?: string[];
}

export interface MenuItem {
  _id: string;
  outletId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  prepTime: number;
  nutrition?: NutritionInfo;
  customizations: CustomizationOption[];
  tags: string[];
  orderCount: number;
  _creationTime: number;
}

export interface CartItemCustomization {
  name: string;
  selected: string;
  price: number;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customizations: CartItemCustomization[];
  specialInstructions?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  outletId: string;
  outletName: string;
  items: CartItem[];
  totalAmount: number;
  _creationTime: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: CartItemCustomization[];
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: number;
  note?: string;
}

export interface Order {
  _id: string;
  userId: string;
  outletId: string;
  outletName: string;
  outletImage: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  statusHistory: OrderStatusUpdate[];
  pickupSlot: string;
  pickupToken: string;
  notes?: string;
  paymentStatus: PaymentStatus;
  estimatedReadyTime?: number;
  _creationTime: number;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  _creationTime: number;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  maxDiscount: number;
  validUntil: number;
  usageLimit: number;
  usedCount: number;
  outletId?: string;
  isActive: boolean;
  _creationTime: number;
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  outletId: string;
  orderId: string;
  rating: number;
  comment: string;
  _creationTime: number;
}

export interface AnalyticsEvent {
  _id: string;
  type: string;
  outletId?: string;
  userId?: string;
  orderId?: string;
  metadata: Record<string, unknown>;
  _creationTime: number;
}

// UI Helper types
export interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

export interface CategoryFilter {
  id: string;
  label: string;
  icon: string;
  count: number;
}
