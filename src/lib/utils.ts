import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

export function generatePickupToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "ST-";
  for (let i = 0; i < 4; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function calculateTax(subtotal: number, rate: number = 0.05): number {
  return Math.round(subtotal * rate);
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case "placed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "accepted": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    case "preparing": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "ready": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "picked_up": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case "placed": return "Order Placed";
    case "accepted": return "Accepted";
    case "preparing": return "Preparing";
    case "ready": return "Ready for Pickup";
    case "picked_up": return "Picked Up";
    case "cancelled": return "Cancelled";
    default: return status;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function getTimeSlots(): { time: string; label: string; available: boolean }[] {
  const slots = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  for (let hour = 8; hour <= 20; hour++) {
    for (const minute of [0, 15, 30, 45]) {
      const isPast = hour < currentHour || (hour === currentHour && minute <= currentMinute);
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      slots.push({
        time: timeStr,
        label: `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`,
        available: !isPast,
      });
    }
  }
  return slots;
}
