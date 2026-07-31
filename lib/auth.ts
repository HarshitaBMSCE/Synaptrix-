import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { demoUserIdForRole } from "@/lib/demo-provider";
import { connectMongo } from "@/lib/mongo";
import { UserProfileModel } from "@/lib/models";

export type AppRole = "worker" | "admin";

export type AppUser = {
  clerkUserId: string;
  role: AppRole;
  isDemo: boolean;
  email?: string;
  displayName?: string;
};

export class AuthRequiredError extends Error {
  constructor(message = "You must be signed in to access this resource.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to access this resource.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class SuspendedUserError extends Error {
  constructor(message = "Your GigShield access is suspended.") {
    super(message);
    this.name = "SuspendedUserError";
  }
}

export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

function roleFromValue(value: unknown): AppRole {
  return value === "admin" ? "admin" : "worker";
}

async function demoRoleFromCookie(): Promise<AppRole | null> {
  const role = (await cookies()).get("gigshield_demo_role")?.value;
  if (role === "worker" || role === "admin") return role;
  return null;
}

export async function getCurrentUserId() {
  return (await requireAuthenticatedUser()).clerkUserId;
}

export async function requireAuthenticatedUser(): Promise<AppUser> {
  if (isDemoMode()) {
    const demoRole = await demoRoleFromCookie();
    if (demoRole) {
      return {
        clerkUserId: process.env.SEED_DEMO_USER_ID ?? demoUserIdForRole(demoRole),
        role: demoRole,
        isDemo: true,
        email: `${demoRole}@demo.gigshield.local`,
        displayName: demoRole === "admin" ? "Demo Admin" : "Demo Worker"
      };
    }
  }

  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  if (!clerkConfigured) {
    throw new AuthRequiredError("Clerk is not configured. Add Clerk keys to .env.local before using private data.");
  }
  const session = await auth();
  if (!session.userId) {
    throw new AuthRequiredError();
  }

  const user = await currentUser();
  const email = user?.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;
  const metadataRole = roleFromValue(user?.publicMetadata?.role);
  const bootstrapById = process.env.BOOTSTRAP_ADMIN_CLERK_USER_ID && process.env.BOOTSTRAP_ADMIN_CLERK_USER_ID === session.userId;
  const bootstrapByEmail = Boolean(email && process.env.BOOTSTRAP_ADMIN_EMAIL && process.env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase() === email.toLowerCase());

  const appUser = {
    clerkUserId: session.userId,
    role: bootstrapById || bootstrapByEmail ? "admin" : metadataRole,
    isDemo: false,
    email,
    displayName: user?.fullName ?? user?.firstName ?? undefined
  };

  try {
    if (await connectMongo()) {
      const profile = (await UserProfileModel.findOneAndUpdate(
        { clerkUserId: appUser.clerkUserId },
        {
          $setOnInsert: {
            clerkUserId: appUser.clerkUserId,
            displayName: appUser.displayName ?? "Gig worker",
            preferredLanguage: "en",
            workerType: "food-delivery",
            city: "Bengaluru",
            vehicleType: "scooter",
            platformsUsed: [],
            operatingCostPerKm: 2.5,
            hourlyEarningsFloor: 0,
            consent: {},
            notificationPreferences: {},
            onboardingCompleted: false,
            status: "active"
          },
          $set: { role: appUser.role }
        },
        { upsert: true, new: true }
      ).lean()) as { status?: string } | null;
      if (profile?.status === "suspended") {
        throw new SuspendedUserError();
      }
    }
  } catch (error) {
    if (error instanceof SuspendedUserError) throw error;
  }

  return appUser;
}

export async function getCurrentAppUser() {
  return requireAuthenticatedUser();
}

export async function getCurrentRole() {
  return (await requireAuthenticatedUser()).role;
}

export async function requireRole(role: AppRole) {
  const user = await requireAuthenticatedUser();
  if (user.role !== role) {
    throw new ForbiddenError();
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export function assertResourceOwner(resourceOwnerId: string, currentUserId: string) {
  if (resourceOwnerId !== currentUserId) {
    throw new ForbiddenError("You can only access your own records.");
  }
}

export function canAccessResource(resourceOwnerId: string, user: AppUser) {
  return user.role === "admin" || resourceOwnerId === user.clerkUserId;
}
