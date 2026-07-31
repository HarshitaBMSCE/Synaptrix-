import { handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { getProfile } from "@/lib/repository";

export async function POST() {
  try {
    const profile = await getProfile(await getCurrentUserId());
    return ok({
      recipients: profile.emergencyContacts,
      message: `${profile.displayName} may need help. Last known route and location: [location link]. Timestamp: ${new Date().toLocaleString("en-IN")}. Please call and confirm safety.`,
      actions: ["call-emergency-services", "call-trusted-contact", "copy-message", "share-location"],
      requiresPreview: true,
      delivered: false
    });
  } catch (error) {
    return handleApiError(error);
  }
}
