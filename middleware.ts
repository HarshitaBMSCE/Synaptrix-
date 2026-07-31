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
  "/settings(.*)",
  "/admin(.*)"
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

export default clerkMiddleware(async (auth, request) => {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const demoRole = request.cookies.get("gigshield_demo_role")?.value;
  const hasDemoSession = isDemoMode() && (demoRole === "worker" || demoRole === "admin");

  if (hasDemoSession) {
    if (isAdminRoute(request) && demoRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  if (!clerkConfigured) {
    if (isProtectedRoute(request)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
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
