import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "SwiftTray — Skip the Queue. Savor the Flavor.",
    template: "%s | SwiftTray",
  },
  description:
    "Smart campus food ordering platform. Pre-order from multiple outlets, skip the queue, and track your order in real-time.",
  keywords: [
    "campus food ordering",
    "pre-order food",
    "skip queue",
    "food delivery",
    "college canteen",
  ],
  authors: [{ name: "SwiftTray Team" }],
  openGraph: {
    title: "SwiftTray — Campus Food Pre-Ordering",
    description: "Pre-order meals, skip the queue, track live.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfe" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans min-h-screen flex flex-col antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
