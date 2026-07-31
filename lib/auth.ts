import { auth } from "@clerk/nextjs/server";
import { DEMO_USER_ID } from "@/lib/demo-data";

export async function getCurrentUserId() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  if (!clerkConfigured) return DEMO_USER_ID;

  try {
    const session = await auth();
    return session.userId ?? DEMO_USER_ID;
  } catch {
    return DEMO_USER_ID;
  }
}
