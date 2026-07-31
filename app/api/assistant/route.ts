import { handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { explainAssistantAnswer } from "@/lib/claude";
import { getJob } from "@/lib/repository";
import { assistantRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const input = assistantRequestSchema.parse(await request.json());
    const job = input.jobId ? await getJob(userId, input.jobId) : null;
    const answer = await explainAssistantAnswer({ message: input.message, job });
    return ok({ answer });
  } catch (error) {
    return handleApiError(error);
  }
}
