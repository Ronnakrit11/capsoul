import { NextResponse } from "next/server";
import { ClerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server";

// Admin middleware to check if user is admin
function isAdmin(email: string | null) {
  return email === "ronnakritnook1@gmail.com";
}

// Create a matcher for the dashboard route
const dashboardMatcher = createRouteMatcher(["/dashboard(.*)"]);

const middleware: ClerkMiddleware = async (request) => {
  const auth = getAuth(request);
  const email = auth.user?.emailAddresses[0]?.emailAddress;

  // Check if trying to access dashboard
  if (dashboardMatcher(request)) {
    if (!auth.userId || !isAdmin(email)) {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
};

export default middleware;

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};