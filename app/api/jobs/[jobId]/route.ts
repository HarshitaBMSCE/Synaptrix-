import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { deleteJob, getJob } from "@/lib/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const job = await getJob(await getCurrentUserId(), (await params).jobId);
    return job ? ok(job) : fail("Job not found", 404);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const deleted = await deleteJob(await getCurrentUserId(), (await params).jobId);
    return deleted ? ok({ deleted }) : fail("Job not found or not owned by user", 404);
  } catch (error) {
    return handleApiError(error);
  }
}
