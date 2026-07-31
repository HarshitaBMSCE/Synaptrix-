import { ok, handleApiError } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";

export async function GET() {
  try {
    return ok(await getDashboardSummary(await getCurrentUserId(), "weekly"));
  } catch (error) {
    return handleApiError(error);
  }
}
