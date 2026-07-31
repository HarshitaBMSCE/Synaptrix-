import { ok, handleApiError } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { evaluateFairness } from "@/lib/fairness";
import { jobInputSchema } from "@/lib/validations";
import { listCommunityJobs, listJobs, saveJob, getProfile } from "@/lib/repository";

export async function GET() {
  try {
    return ok(await listJobs(await getCurrentUserId()));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const input = jobInputSchema.parse(await request.json());
    const job = await saveJob(userId, {
      ...input,
      completedAt: input.completedAt || input.startedAt,
      evidenceAssetIds: input.evidenceAssetIds,
      notes: input.notes,
      extraction: {
        provider: input.captureMethod === "manual" ? "demo" : "claude",
        overallConfidence: input.extractionConfidence,
        fieldConfidence: {},
        warnings: [],
        visibleComponents: input.visibleComponents
      }
    });
    const profile = await getProfile(userId);
    const evaluation = evaluateFairness({ job, profile, communityJobs: listCommunityJobs(), extractionConfidence: input.extractionConfidence });
    return ok({ job, evaluation }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
