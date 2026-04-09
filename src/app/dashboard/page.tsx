import { redirect } from "next/navigation";

/**
 * Legacy /dashboard route — redirects to /student/dashboard.
 * Keeps old bookmarks and links working.
 */
export default function LegacyDashboardRedirect() {
  redirect("/student/dashboard");
}
