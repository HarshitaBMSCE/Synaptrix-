import { z } from "zod";
import { fail, handleApiError, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { recordAuditLog } from "@/lib/admin";
import { BenchmarkConfigurationModel } from "@/lib/models";
import { requireMongo } from "@/lib/mongo";

const benchmarkUpdateSchema = z.object({
  version: z.string().min(3).max(80),
  baseFare: z.coerce.number().min(0),
  paidDeliveryDistancePerKm: z.coerce.number().min(0),
  pickupAllowancePerKm: z.coerce.number().min(0),
  activeTimeAllowancePerMinute: z.coerce.number().min(0),
  waitingAllowancePerMinute: z.coerce.number().min(0),
  rainBonus: z.coerce.number().min(0),
  nightPremiumRate: z.coerce.number().min(0).max(1),
  defaultOperatingCostPerKm: z.coerce.number().min(0),
  minimumHourlyEarningFloor: z.coerce.number().min(0),
  notes: z.string().max(1000).default(""),
  effectiveDate: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin();
    const input = benchmarkUpdateSchema.parse(await request.json());
    await requireMongo();
    const record = await BenchmarkConfigurationModel.create({
      ...input,
      effectiveDate: new Date(input.effectiveDate),
      createdBy: actor.clerkUserId
    });
    await recordAuditLog({ actor, action: "benchmark.updated", resourceType: "BenchmarkConfiguration", resourceId: String(record._id), metadata: { version: input.version } });
    return ok({ id: String(record._id), version: record.version }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  return fail("Use /admin/benchmarks for benchmark viewing.", 404);
}
