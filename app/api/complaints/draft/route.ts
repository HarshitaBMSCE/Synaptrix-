import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { draftComplaint } from "@/lib/claude";
import { getJob, saveComplaint } from "@/lib/repository";
import { complaintDraftSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const input = complaintDraftSchema.parse(await request.json());
    const jobs = (await Promise.all(input.jobIds.map((jobId) => getJob(userId, jobId)))).filter((job) => job !== null);
    if (jobs.length === 0) return fail("No owned jobs found for complaint", 404);
    const draft = await draftComplaint({ jobs, type: input.type, tone: input.tone });
    const complaint = await saveComplaint({
      id: `complaint-${Date.now()}`,
      clerkUserId: userId,
      jobIds: jobs.map((job) => job.id),
      type: input.type,
      tone: input.tone,
      subject: draft.subject,
      body: draft.body,
      requestedRemedy: draft.requestedRemedy,
      status: "draft",
      attachmentAssetIds: jobs.flatMap((job) => job.evidenceAssetIds),
      generatedByClaude: Boolean(process.env.ANTHROPIC_API_KEY),
      createdAt: new Date().toISOString()
    });
    return ok(complaint, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
