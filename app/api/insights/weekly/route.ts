import { handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { weeklyNarrative } from "@/lib/claude";
import { getDashboardSummary } from "@/lib/dashboard";

export async function GET() {
  try {
    const summary = await getDashboardSummary(await getCurrentUserId(), "weekly");
    const narrative = await weeklyNarrative(summary);
    return ok({ metrics: summary, narrative });
  } catch (error) {
    return handleApiError(error);
  }
}
