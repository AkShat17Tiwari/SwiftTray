import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

const protectedPrefixes = [
  "/admin",
  "/vendor",
  "/student",
  "/dashboard",
  "/orders",
  "/checkout",
  "/support",
];

export default async function proxy(request: NextRequest) {
  const protectedRoute = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );
  if (!protectedRoute || request.nextUrl.pathname.endsWith("/access")) {
    return NextResponse.next();
  }
  if (!(await isAuthenticated())) {
    const loginPath = request.nextUrl.pathname.startsWith("/admin")
      ? "/sign-in/admin"
      : request.nextUrl.pathname.startsWith("/vendor")
        ? "/sign-in/vendor"
        : "/sign-in/student";
    const signIn = new URL(loginPath, request.url);
    signIn.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
