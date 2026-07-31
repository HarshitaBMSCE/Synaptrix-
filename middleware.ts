import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/dashboard(.*)",
  "/jobs(.*)",
  "/assistant(.*)",
  "/routes(.*)",
  "/complaints(.*)",
  "/evidence(.*)",
  "/community(.*)",
  "/savings(.*)",
  "/insights(.*)",
  "/notifications(.*)",
  "/settings(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return NextResponse.next();
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
