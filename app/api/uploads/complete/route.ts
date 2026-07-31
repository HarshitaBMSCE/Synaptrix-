import { handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { saveEvidence } from "@/lib/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = await getCurrentUserId();
    const asset = await saveEvidence({
      id: `asset-${Date.now()}`,
      clerkUserId: userId,
      objectKey: String(body.objectKey),
      originalFileName: String(body.originalFileName ?? "uploaded-evidence"),
      mimeType: String(body.mimeType ?? "application/octet-stream"),
      size: Number(body.size ?? 0),
      checksum: body.checksum,
      category: body.category ?? "screenshot",
      retainedWithConsent: Boolean(body.retainedWithConsent),
      retentionDate: body.retentionDate,
      createdAt: new Date().toISOString()
    });
    return ok(asset, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
