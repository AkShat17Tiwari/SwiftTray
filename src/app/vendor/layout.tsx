"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3,
  Package, Settings,
} from "lucide-react";

const VENDOR_NAV = [
  { label: "Overview", href: "/vendor", icon: LayoutDashboard },
  { label: "Orders", href: "/vendor/orders", icon: ShoppingBag, badge: 0 },
  { label: "Menu", href: "/vendor/menu", icon: UtensilsCrossed },
  { label: "Inventory", href: "/vendor/inventory", icon: Package },
  { label: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { label: "Settings", href: "/vendor/settings", icon: Settings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        title="SwiftTray"
        subtitle="Vendor Portal"
        items={VENDOR_NAV}
        accentColor="from-indigo-500 to-purple-500"
      />
      <main className="lg:pl-[260px] pt-4 pb-20 lg:pb-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
