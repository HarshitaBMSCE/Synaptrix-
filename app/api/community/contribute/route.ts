import { handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { addCommunityJob } from "@/lib/repository";
import { communityContributionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const input = communityContributionSchema.parse(await request.json());
    const userId = await getCurrentUserId();
    const sample = await addCommunityJob({
      ...input,
      anonymousContributorId: userId.startsWith("demo-") ? userId : `hash-${userId.slice(-6)}`
    });
    return ok(sample, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
