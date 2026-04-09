"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import {
  LayoutDashboard, Store, UserCheck, ShoppingBag, BarChart3,
  Ticket, Megaphone, Shield, Users, Tag,
} from "lucide-react";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Outlets", href: "/admin/outlets", icon: Store },
  { label: "Vendors", href: "/admin/vendors", icon: UserCheck },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Tickets", href: "/admin/tickets", icon: Ticket },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Audit Log", href: "/admin/audit", icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        title="SwiftTray"
        subtitle="Admin Control Center"
        items={ADMIN_NAV}
        accentColor="from-rose-500 to-orange-500"
      />
      <main className="lg:pl-[260px] pt-4 pb-20 lg:pb-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
