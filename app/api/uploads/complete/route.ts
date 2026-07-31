import { handleApiError, ok } from "@/lib/api";
import { ForbiddenError, getCurrentAppUser } from "@/lib/auth";
import { extractScreenshotJob, extractionToJobInput } from "@/lib/extraction";
import { saveEvidence } from "@/lib/repository";
import { getPrivateObjectBytes, isS3Configured } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getCurrentAppUser();
    const demoMode = user.isDemo || body.mode === "demo" || !isS3Configured();
    const objectKey = String(body.objectKey);
    if (!demoMode && !objectKey.startsWith(`users/${user.clerkUserId}/`)) {
      throw new ForbiddenError("Upload object key does not belong to the authenticated user.");
    }
    const asset = await saveEvidence({
      id: `asset-${Date.now()}`,
      clerkUserId: user.clerkUserId,
      objectKey,
      originalFileName: String(body.originalFileName ?? "uploaded-evidence"),
      mimeType: String(body.mimeType ?? "application/octet-stream"),
      size: Number(body.size ?? 0),
      checksum: body.checksum,
      category: body.category ?? "screenshot",
      retainedWithConsent: Boolean(body.retainedWithConsent),
      retentionDate: body.retentionDate,
      createdAt: new Date().toISOString()
    });
    const imageBuffer = demoMode ? undefined : await getPrivateObjectBytes(asset.objectKey);
    const { extraction, provider } = await extractScreenshotJob(
      imageBuffer ? { buffer: imageBuffer, mimeType: asset.mimeType } : undefined,
      demoMode
    );
    return ok(
      {
        asset,
        provider,
        label: provider === "demo" ? "Demo extraction" : "Claude extraction",
        extraction,
        jobInput: extractionToJobInput(extraction, [asset.id])
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
