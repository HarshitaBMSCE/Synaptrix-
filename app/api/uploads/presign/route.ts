import { handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { createPresignedUpload } from "@/lib/s3";
import { uploadPresignSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const input = uploadPresignSchema.parse(await request.json());
    const upload = await createPresignedUpload({ clerkUserId: await getCurrentUserId(), ...input });
    return ok(upload);
  } catch (error) {
    return handleApiError(error);
  }
}
