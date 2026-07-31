import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { recordAuditLog } from "@/lib/admin";
import { UserProfileModel } from "@/lib/models";
import { requireMongo } from "@/lib/mongo";

const userPatchSchema = z.object({
  role: z.enum(["worker", "admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  reason: z.string().min(3).max(400)
});

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const actor = await requireAdmin();
    const { userId } = await params;
    const input = userPatchSchema.parse(await request.json());
    if (userId === actor.clerkUserId && input.role === "worker") {
      return fail("Admins cannot lower their own role through this endpoint.", 403);
    }
    await requireMongo();
    const record = await UserProfileModel.findOneAndUpdate(
      { clerkUserId: userId },
      { $set: { role: input.role, status: input.status } },
      { new: true, upsert: false }
    );
    if (!record) return fail("User profile not found", 404);
    await recordAuditLog({ actor, action: input.role ? "user.role_changed" : "user.status_changed", resourceType: "UserProfile", resourceId: userId, metadata: input, reason: input.reason });
    return ok({ userId, role: record.role, status: record.status });
  } catch (error) {
    return handleApiError(error);
  }
}
