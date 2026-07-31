import { handleApiError, ok } from "@/lib/api";
import { getCurrentAppUser } from "@/lib/auth";
import { createPresignedUpload, isS3Configured } from "@/lib/s3";
import { uploadPresignSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getCurrentAppUser();
    const input = uploadPresignSchema.parse(await request.json());
    if (!isS3Configured()) {
      throw new Error("AWS S3 credentials are required before screenshots can be uploaded.");
    }
    const upload = await createPresignedUpload({ clerkUserId: user.clerkUserId, ...input });
    return ok({ mode: "s3", ...upload });
  } catch (error) {
    return handleApiError(error);
  }
}
