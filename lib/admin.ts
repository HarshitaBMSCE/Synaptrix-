import { requireAdmin, type AppUser } from "@/lib/auth";
import { bengaluruBenchmark } from "@/lib/fairness";
import {
  AuditLogModel,
  BenchmarkConfigurationModel,
  CommunityJobModel,
  ComplaintModel,
  IncidentModel,
  JobModel,
  PlatformModel,
  RightsSnippetModel,
  UserProfileModel
} from "@/lib/models";
import { requireMongo } from "@/lib/mongo";

type AdminAuditLog = {
  id: string;
  actorClerkUserId: string;
  actorRole: AppUser["role"];
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  reason?: string;
  requestId?: string;
  createdAt: string;
};

type AdminPlatformSummary = {
  id?: string;
  name: string;
  category: string;
  supportedJobTypes: string[];
  active: boolean;
  displayOrder: number;
  benchmarkAvailable: boolean;
  createdAt?: string;
};

type AdminUserSummary = {
  id: string;
  displayName: string;
  role: AppUser["role"];
  workerType: string;
  city: string;
  platformsUsed: string[];
  onboardingCompleted: boolean;
  status: "active" | "suspended";
  createdAt: string;
};

type AdminBenchmark = typeof bengaluruBenchmark & {
  id?: string;
  effectiveDate: string;
  notes: string;
  createdAt?: string;
};

type AdminGenericRecord = Record<string, unknown> & {
  id: string;
  createdAt: string;
};

const seededPlatforms: AdminPlatformSummary[] = [
  { name: "Swiggy", category: "Food delivery", supportedJobTypes: ["delivery"], active: true, displayOrder: 1, benchmarkAvailable: true },
  { name: "Zomato", category: "Food delivery", supportedJobTypes: ["delivery"], active: true, displayOrder: 2, benchmarkAvailable: true },
  { name: "Blinkit", category: "Grocery delivery", supportedJobTypes: ["delivery"], active: true, displayOrder: 3, benchmarkAvailable: true },
  { name: "Uber", category: "Cab", supportedJobTypes: ["ride"], active: true, displayOrder: 4, benchmarkAvailable: true },
  { name: "Ola", category: "Cab", supportedJobTypes: ["ride"], active: true, displayOrder: 5, benchmarkAvailable: true },
  { name: "Rapido", category: "Bike taxi", supportedJobTypes: ["ride"], active: true, displayOrder: 6, benchmarkAvailable: true }
];

function createdAt(record: { createdAt?: Date | string }) {
  return record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString();
}

function normalizeAuditLog(record: Partial<AdminAuditLog> & { _id?: unknown; createdAt?: Date | string }): AdminAuditLog {
  return {
    id: String(record.id ?? record._id ?? `audit-${Date.now()}`),
    actorClerkUserId: String(record.actorClerkUserId ?? "unknown"),
    actorRole: record.actorRole === "worker" ? "worker" : "admin",
    action: String(record.action ?? "audit.unknown"),
    resourceType: String(record.resourceType ?? "Unknown"),
    resourceId: String(record.resourceId ?? ""),
    metadata: record.metadata ?? {},
    reason: record.reason,
    requestId: record.requestId,
    createdAt: createdAt(record)
  };
}

function defaultBenchmark(): AdminBenchmark {
  return { ...bengaluruBenchmark, effectiveDate: "2026-07-31", notes: "Independent benchmark assumptions." };
}

function normalizePlatform(record: Partial<AdminPlatformSummary> & { _id?: unknown; createdAt?: Date | string }): AdminPlatformSummary {
  return {
    id: record._id ? String(record._id) : record.id,
    name: String(record.name ?? "Unknown platform"),
    category: String(record.category ?? "Gig platform"),
    supportedJobTypes: Array.isArray(record.supportedJobTypes) ? record.supportedJobTypes.map(String) : [],
    active: record.active ?? true,
    displayOrder: Number(record.displayOrder ?? 0),
    benchmarkAvailable: record.benchmarkAvailable ?? false,
    createdAt: record.createdAt ? createdAt(record) : undefined
  };
}

function normalizeAdminUser(record: Partial<AdminUserSummary> & { _id?: unknown; createdAt?: Date | string; clerkUserId?: string }): AdminUserSummary {
  return {
    id: String(record.clerkUserId ?? record.id ?? record._id ?? "unknown-user"),
    displayName: String(record.displayName ?? record.clerkUserId ?? record.id ?? "Gig worker"),
    role: record.role === "admin" ? "admin" : "worker",
    workerType: String(record.workerType ?? "food-delivery"),
    city: String(record.city ?? "Bengaluru"),
    platformsUsed: Array.isArray(record.platformsUsed) ? record.platformsUsed.map(String) : [],
    onboardingCompleted: Boolean(record.onboardingCompleted),
    status: record.status === "suspended" ? "suspended" : "active",
    createdAt: createdAt(record)
  };
}

function normalizeBenchmark(record: Partial<AdminBenchmark> & { _id?: unknown; createdAt?: Date | string; effectiveDate?: Date | string }): AdminBenchmark {
  return {
    id: record._id ? String(record._id) : record.id,
    version: String(record.version ?? bengaluruBenchmark.version),
    baseFare: Number(record.baseFare ?? bengaluruBenchmark.baseFare),
    paidDeliveryDistancePerKm: Number(record.paidDeliveryDistancePerKm ?? bengaluruBenchmark.paidDeliveryDistancePerKm),
    pickupAllowancePerKm: Number(record.pickupAllowancePerKm ?? bengaluruBenchmark.pickupAllowancePerKm),
    activeTimeAllowancePerMinute: Number(record.activeTimeAllowancePerMinute ?? bengaluruBenchmark.activeTimeAllowancePerMinute),
    waitingAllowancePerMinute: Number(record.waitingAllowancePerMinute ?? bengaluruBenchmark.waitingAllowancePerMinute),
    nightPremiumRate: Number(record.nightPremiumRate ?? bengaluruBenchmark.nightPremiumRate),
    rainBonus: Number(record.rainBonus ?? bengaluruBenchmark.rainBonus),
    defaultOperatingCostPerKm: Number(record.defaultOperatingCostPerKm ?? bengaluruBenchmark.defaultOperatingCostPerKm),
    minimumHourlyEarningFloor: Number(record.minimumHourlyEarningFloor ?? bengaluruBenchmark.minimumHourlyEarningFloor),
    reliableCommunitySampleSize: Number(record.reliableCommunitySampleSize ?? bengaluruBenchmark.reliableCommunitySampleSize),
    effectiveDate: record.effectiveDate ? new Date(record.effectiveDate).toISOString() : "2026-07-31",
    notes: String(record.notes ?? "Independent benchmark assumptions."),
    createdAt: record.createdAt ? createdAt(record) : undefined
  };
}

function normalizeGenericRecord(record: Record<string, unknown> & { _id?: unknown; createdAt?: Date | string }): AdminGenericRecord {
  return {
    ...record,
    id: String(record._id ?? `record-${Date.now()}`),
    createdAt: createdAt(record)
  };
}

async function adminUser() {
  return requireAdmin();
}

export async function getAdminOverview() {
  await adminUser();
  await requireMongo();
  const [totalRegisteredUsers, activeWorkers, jobsLogged, complaintsGenerated, pendingIncidentReports, pendingCommunitySubmissions, platformCount, recentAdminActivity] =
    await Promise.all([
      UserProfileModel.countDocuments({}),
      UserProfileModel.countDocuments({ status: "active", role: "worker" }),
      JobModel.countDocuments({}),
      ComplaintModel.countDocuments({}),
      IncidentModel.countDocuments({ moderationStatus: "pending" }),
      CommunityJobModel.countDocuments({ moderationStatus: "pending" }),
      PlatformModel.countDocuments({ active: true }),
      AuditLogModel.find({}).sort({ createdAt: -1 }).limit(8).lean()
    ]);

  return {
    totalRegisteredUsers,
    activeWorkers,
    jobsLogged,
    jobsFlaggedAsUnderpaid: 0,
    fairnessDistribution: [
      { bucket: "Fair", count: 0 },
      { bucket: "Borderline", count: 0 },
      { bucket: "Underpaid", count: 0 }
    ],
    complaintsGenerated,
    pendingIncidentReports,
    pendingCommunitySubmissions,
    platformCount,
    benchmarkVersion: bengaluruBenchmark.version,
    recentAdminActivity: (recentAdminActivity as Array<Partial<AdminAuditLog> & { _id?: unknown; createdAt?: Date | string }>).map(normalizeAuditLog)
  };
}

export async function listAdminUsers(): Promise<AdminUserSummary[]> {
  await adminUser();
  await requireMongo();
  const records = await UserProfileModel.find({}).select("clerkUserId displayName role workerType city platformsUsed onboardingCompleted status createdAt").sort({ createdAt: -1 }).lean();
  return (records as Array<Partial<AdminUserSummary> & { _id?: unknown; createdAt?: Date | string; clerkUserId?: string }>).map(normalizeAdminUser);
}

export async function listAdminPlatforms(): Promise<AdminPlatformSummary[]> {
  await adminUser();
  await requireMongo();
  const records = await PlatformModel.find({}).sort({ displayOrder: 1 }).lean();
  return records.length > 0 ? (records as Array<Partial<AdminPlatformSummary> & { _id?: unknown; createdAt?: Date | string }>).map(normalizePlatform) : seededPlatforms;
}

export async function listAdminBenchmarks(): Promise<AdminBenchmark[]> {
  await adminUser();
  await requireMongo();
  const records = await BenchmarkConfigurationModel.find({}).sort({ effectiveDate: -1 }).lean();
  return records.length > 0 ? (records as Array<Partial<AdminBenchmark> & { _id?: unknown; createdAt?: Date | string; effectiveDate?: Date | string }>).map(normalizeBenchmark) : [defaultBenchmark()];
}

export async function listAdminCommunity(): Promise<AdminGenericRecord[]> {
  await adminUser();
  await requireMongo();
  const records = await CommunityJobModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
  return (records as Array<Record<string, unknown> & { _id?: unknown; createdAt?: Date | string }>).map(normalizeGenericRecord);
}

export async function listAdminIncidents(): Promise<AdminGenericRecord[]> {
  await adminUser();
  await requireMongo();
  const records = await IncidentModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
  return (records as Array<Record<string, unknown> & { _id?: unknown; createdAt?: Date | string }>).map(normalizeGenericRecord);
}

export async function listAdminRights(): Promise<AdminGenericRecord[]> {
  await adminUser();
  await requireMongo();
  const records = await RightsSnippetModel.find({}).sort({ theme: 1 }).lean();
  return (records as Array<Record<string, unknown> & { _id?: unknown; createdAt?: Date | string }>).map(normalizeGenericRecord);
}

export async function listAdminAuditLogs(): Promise<AdminAuditLog[]> {
  await adminUser();
  await requireMongo();
  const records = await AuditLogModel.find({}).sort({ createdAt: -1 }).limit(100).lean();
  return (records as Array<Partial<AdminAuditLog> & { _id?: unknown; createdAt?: Date | string }>).map(normalizeAuditLog);
}

export async function recordAuditLog(args: {
  actor: AppUser;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  reason?: string;
  requestId?: string;
}) {
  await requireMongo();
  await AuditLogModel.create({
    actorClerkUserId: args.actor.clerkUserId,
    actorRole: args.actor.role,
    action: args.action,
    resourceType: args.resourceType,
    resourceId: args.resourceId,
    metadata: args.metadata,
    reason: args.reason,
    requestId: args.requestId
  });
}
