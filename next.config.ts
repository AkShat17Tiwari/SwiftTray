import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent the app from being embedded in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Block MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin for cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Opt out of powerful browser features the app never uses
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Force HTTPS for a year once seen over HTTPS (safe on Vercel/HTTPS hosts)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Pin the tracing root to this project so stray lockfiles in parent
  // directories don't confuse the build
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
