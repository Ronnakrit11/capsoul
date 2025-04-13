import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This is the main middleware function
export function middleware(request: NextRequest) {
  // Only handle dashboard routes (excluding login page)
  if (
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !request.nextUrl.pathname.startsWith("/dashboard/login")
  ) {
    // For API routes, allow access
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Check for the authentication cookie
    const dashboardAuth = request.cookies.get("dashboard_auth");
    
    // If not authenticated, redirect to login page
    if (!dashboardAuth || dashboardAuth.value !== "true") {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }

  // For all other routes, pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match dashboard routes
    "/dashboard/:path*",
    // And API routes
    "/api/:path*",
  ],
};