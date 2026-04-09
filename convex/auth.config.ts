// Convex auth config for Clerk integration
// Replace the domain with your actual Clerk Frontend API URL
export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL || "https://your-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
