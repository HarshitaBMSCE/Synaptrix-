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
import { isDemoUserId } from "@/lib/demo-provider";

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

const demoAuditLogs: AdminAuditLog[] = [
  {
    id: "demo-audit-1",
    actorClerkUserId: "demo-admin",
    actorRole: "admin",
    action: "benchmark.viewed",
    resourceType: "BenchmarkConfiguration",
    resourceId: bengaluruBenchmark.version,
    metadata: { source: "demo" },
    createdAt: new Date().toISOString()
  }
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

function fallbackBenchmark(): AdminBenchmark {
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

function assertDemoAdmin(user: AppUser) {
  if (user.isDemo && user.role !== "admin") {
    throw new Error("Demo worker cannot access admin data.");
  }
}

export async function getAdminOverview() {
  const user = await adminUser();
  assertDemoAdmin(user);
  if (isDemoUserId(user.clerkUserId)) {
    return {
      totalRegisteredUsers: 7,
      activeWorkers: 6,
      jobsLogged: 24,
      jobsFlaggedAsUnderpaid: 5,
      fairnessDistribution: [
        { bucket: "Fair", count: 12 },
        { bucket: "Borderline", count: 7 },
        { bucket: "Underpaid", count: 5 }
      ],
      complaintsGenerated: 4,
      pendingIncidentReports: 2,
      pendingCommunitySubmissions: 3,
      platformCount: seededPlatforms.length,
      benchmarkVersion: bengaluruBenchmark.version,
      recentAdminActivity: demoAuditLogs
    };
  }

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
  const user = await adminUser();
  if (isDemoUserId(user.clerkUserId)) {
    return [
      { id: "demo-worker", displayName: "Demo Worker", role: "worker", workerType: "food-delivery", city: "Bengaluru", platformsUsed: ["Swiggy"], onboardingCompleted: true, status: "active", createdAt: new Date().toISOString() },
      { id: "demo-admin", displayName: "Demo Admin", role: "admin", workerType: "food-delivery", city: "Bengaluru", platformsUsed: [], onboardingCompleted: true, status: "active", createdAt: new Date().toISOString() }
    ];
  }
  await requireMongo();
  const records = await UserProfileModel.find({}).select("clerkUserId displayName role workerType city platformsUsed onboardingCompleted status createdAt").sort({ createdAt: -1 }).lean();
  return (records as Array<Partial<AdminUserSummary> & { _id?: unknown; createdAt?: Date | string; clerkUserId?: string }>).map(normalizeAdminUser);
}

export async function listAdminPlatforms(): Promise<AdminPlatformSummary[]> {
  const user = await adminUser();
  if (isDemoUserId(user.clerkUserId)) return seededPlatforms;
  await requireMongo();
  const records = await PlatformModel.find({}).sort({ displayOrder: 1 }).lean();
  return records.length > 0 ? (records as Array<Partial<AdminPlatformSummary> & { _id?: unknown; createdAt?: Date | string }>).map(normalizePlatform) : seededPlatforms;
}

export async function listAdminBenchmarks(): Promise<AdminBenchmark[]> {
  const user = await adminUser();
  if (isDemoUserId(user.clerkUserId)) return [fallbackBenchmark()];
  await requireMongo();
  const records = await BenchmarkConfigurationModel.find({}).sort({ effectiveDate: -1 }).lean();
  return records.length > 0 ? (records as Array<Partial<AdminBenchmark> & { _id?: unknown; createdAt?: Date | string; effectiveDate?: Date | string }>).map(normalizeBenchmark) : [fallbackBenchmark()];
}

export async function listAdminCommunity(): Promise<AdminGenericRecord[]> {
  const user = await adminUser();
  if (isDemoUserId(user.clerkUserId)) return [];
  await requireMongo();
  const records = await CommunityJobModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
  return (records as Array<Record<string, unknown> & { _id?: unknown; createdAt?: Date | string }>).map(normalizeGenericRecord);
}

export async function listAdminIncidents(): Promise<AdminGenericRecord[]> {
  const user = await adminUser();
  if (isDemoUserId(user.clerkUserId)) return [];
  await requireMongo();
  const records = await IncidentModel.find({}).sort({ createdAt: -1 }).limit(50).lean();
  return (records as Array<Record<string, unknown> & { _id?: unknown; createdAt?: Date | string }>).map(normalizeGenericRecord);
}

export async function listAdminRights(): Promise<AdminGenericRecord[]> {
  const user = await adminUser();
  if (isDemoUserId(user.clerkUserId)) return [];
  await requireMongo();
  const records = await RightsSnippetModel.find({}).sort({ theme: 1 }).lean();
  return (records as Array<Record<string, unknown> & { _id?: unknown; createdAt?: Date | string }>).map(normalizeGenericRecord);
}

export async function listAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const user = await adminUser();
  if (isDemoUserId(user.clerkUserId)) return demoAuditLogs;
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
  if (isDemoUserId(args.actor.clerkUserId)) {
    demoAuditLogs.unshift({
      id: `demo-audit-${Date.now()}`,
      actorClerkUserId: args.actor.clerkUserId,
      actorRole: args.actor.role,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId ?? "",
      metadata: args.metadata ?? {},
      createdAt: new Date().toISOString()
    });
    return;
  }
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
