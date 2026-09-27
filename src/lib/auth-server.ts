import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const {
  handler,
  getToken,
  isAuthenticated,
  fetchAuthAction,
  fetchAuthMutation,
  fetchAuthQuery,
  preloadAuthQuery,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
