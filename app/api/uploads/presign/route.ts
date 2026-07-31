import { handleApiError, ok } from "@/lib/api";
import { getCurrentAppUser } from "@/lib/auth";
import { createPresignedUpload, isS3Configured } from "@/lib/s3";
import { uploadPresignSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getCurrentAppUser();
    const input = uploadPresignSchema.parse(await request.json());
    if (user.isDemo || !isS3Configured()) {
      return ok({
        mode: "demo",
        objectKey: `demo/${user.clerkUserId}/screenshots/${Date.now()}-${input.fileName}`,
        uploadUrl: null,
        headers: {},
        message: "Demo extraction mode is active because S3 is unavailable or demo mode is selected."
      });
    }
    const upload = await createPresignedUpload({ clerkUserId: user.clerkUserId, ...input });
    return ok({ mode: "s3", ...upload });
  } catch (error) {
    return handleApiError(error);
  }
}
