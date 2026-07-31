import { handleApiError, ok } from "@/lib/api";
import { getCurrentUserId } from "@/lib/auth";
import { getRouteOptions } from "@/lib/maps";
import { listWorkSessions } from "@/lib/repository";
import { routeRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const input = routeRequestSchema.parse(await request.json());
    const sessions = await listWorkSessions(await getCurrentUserId());
    const routes = await getRouteOptions({ ...input, fatigueScore: sessions[0]?.fatigueScore ?? 0 });
    return ok({ routes });
  } catch (error) {
    return handleApiError(error);
  }
}
