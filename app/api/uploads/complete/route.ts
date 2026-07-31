import { handleApiError, ok } from "@/lib/api";
import { ForbiddenError, getCurrentAppUser } from "@/lib/auth";
import { extractScreenshotJob, extractionToJobInput, extractionWarnings, hasUsableScreenshotExtraction } from "@/lib/extraction";
import { saveEvidence } from "@/lib/repository";
import { getPrivateObjectBytes, isS3Configured } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getCurrentAppUser();
    const objectKey = String(body.objectKey);
    if (!isS3Configured()) {
      throw new Error("AWS S3 credentials are required before screenshots can be processed.");
    }
    if (!objectKey.startsWith(`users/${user.clerkUserId}/`)) {
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
    const imageBuffer = await getPrivateObjectBytes(asset.objectKey);
    const { extraction, provider } = await extractScreenshotJob({ buffer: imageBuffer, mimeType: asset.mimeType });
    const usableExtraction = hasUsableScreenshotExtraction(extraction);
    return ok(
      {
        asset,
        provider,
        label: "Claude extraction",
        extraction: {
          ...extraction,
          warnings: extractionWarnings(extraction)
        },
        jobInput: usableExtraction ? extractionToJobInput(extraction, [asset.id]) : null
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
