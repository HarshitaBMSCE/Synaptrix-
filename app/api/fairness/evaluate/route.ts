import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { evaluateJob } from "@/lib/repository";

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    if (typeof jobId !== "string") return fail("jobId is required", 422);
    const evaluation = await evaluateJob(await getCurrentUserId(), jobId);
    return evaluation ? ok(evaluation) : fail("Job not found", 404);
  } catch (error) {
    return handleApiError(error);
  }
}
