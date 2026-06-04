"use client";

import Link from "next/link";
import { ChefHat, Globe, MessageCircle, ExternalLink, Heart } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#E4EBF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top divider - neumorphic embossed line */}
        <div className="h-[2px] mb-12 rounded-full shadow-[inset_1px_1px_2px_rgba(163,177,198,0.5),inset_-1px_-1px_2px_#FFFFFF]" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="neu-icon-mint w-9 h-9 rounded-xl">
                <ChefHat className="w-5 h-5 text-[#1A2E35]" />
              </div>
              <span className="text-xl font-bold gradient-text">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart campus food ordering. Pre-order, skip queues, and track your
              meal in real-time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/outlets", label: "All Outlets" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/orders", label: "My Orders" },
                { href: "/admin", label: "Vendor Panel" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-2.5">
              {[
                { href: "#faq", label: "FAQ" },
                { href: "#", label: "Help Center" },
                { href: "#", label: "Contact Us" },
                { href: "#", label: "Report an Issue" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus */}
          <div>
            <h3 className="text-sm font-semibold mb-4">For Vendors</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/admin", label: "Vendor Dashboard" },
                { href: "#", label: "Register Outlet" },
                { href: "#", label: "Partner Benefits" },
                { href: "#", label: "Analytics" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 gap-4">
          {/* Neumorphic embossed divider */}
          <div className="absolute left-0 right-0 h-[2px] rounded-full shadow-[inset_1px_1px_2px_rgba(163,177,198,0.5),inset_-1px_-1px_2px_#FFFFFF]" style={{ marginTop: "-2rem" }} />
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © {currentYear} {APP_NAME}. Made with{" "}
            <Heart className="w-3.5 h-3.5 text-[#FF8A80] fill-[#FF8A80]" /> for campus life.
          </p>

          <div className="flex items-center gap-3">
            {[
              { icon: MessageCircle, href: "#", label: "Twitter" },
              { icon: ExternalLink, href: "#", label: "Instagram" },
              { icon: Globe, href: "#", label: "GitHub" },
            ].map(({ icon: Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                className="w-9 h-9 rounded-full neu-btn flex items-center justify-center text-muted-foreground hover:text-primary"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
