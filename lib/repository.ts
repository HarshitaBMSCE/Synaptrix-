import { evaluateFairness } from "@/lib/fairness";
import {
  CommunityJobModel,
  ComplaintModel,
  EvidenceAssetModel,
  JobModel,
  NotificationModel,
  SavingsGoalModel,
  UserProfileModel,
  WorkSessionModel
} from "@/lib/models";
import { requireMongo } from "@/lib/mongo";
import type { CommunityJob, Complaint, EvidenceAsset, Job, Notification, SavingsGoal, UserProfile, WorkSession } from "@/lib/types";

type MongoId = {
  toString(): string;
};

type MongoRecord = {
  _id: MongoId;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type JobRecord = Omit<Job, "id" | "startedAt" | "completedAt"> &
  MongoRecord & {
    startedAt: Date | string;
    completedAt: Date | string;
  };

type EvidenceRecord = Omit<EvidenceAsset, "id" | "createdAt" | "retentionDate"> &
  MongoRecord & {
    retentionDate?: Date | string;
  };

type ComplaintRecord = Omit<Complaint, "id" | "createdAt"> & MongoRecord;
type WorkSessionRecord = Omit<WorkSession, "id" | "startedAt" | "endedAt"> &
  MongoRecord & {
    startedAt: Date | string;
    endedAt?: Date | string;
  };
type SavingsGoalRecord = Omit<SavingsGoal, "id" | "deadline" | "contributionHistory"> &
  MongoRecord & {
    deadline: Date | string;
    contributionHistory?: Array<{ amount: number; date: Date | string }>;
  };
type NotificationRecord = Omit<Notification, "id" | "createdAt"> & MongoRecord;
type CommunityJobRecord = Omit<CommunityJob, "occurredAt"> &
  MongoRecord & {
    occurredAt: Date | string;
  };

function iso(value: Date | string | undefined) {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function defaultProfile(clerkUserId: string): UserProfile {
  return {
    id: "profile-new",
    clerkUserId,
    displayName: "Gig worker",
    preferredLanguage: "en",
    workerType: "food-delivery",
    city: "Bengaluru",
    vehicleType: "scooter",
    platformsUsed: [],
    operatingCostPerKm: 2.5,
    hourlyEarningsFloor: 0,
    emergencyContacts: [],
    consent: {
      evidenceRetention: false,
      communityContribution: false,
      location: false,
      microphone: false,
      notifications: false
    },
    notificationPreferences: {
      weeklyInsight: false,
      fatigue: false,
      complaintFollowUp: false,
      unsafeWeather: false,
      savings: false
    },
    onboardingCompleted: false
  };
}

function toProfile(record: (Partial<UserProfile> & MongoRecord) | null, clerkUserId: string): UserProfile {
  if (!record) return defaultProfile(clerkUserId);
  const baseProfile = defaultProfile(clerkUserId);
  return {
    ...baseProfile,
    ...record,
    id: record._id.toString(),
    clerkUserId
  };
}

function toJob(record: JobRecord): Job {
  return {
    ...record,
    id: record._id.toString(),
    startedAt: iso(record.startedAt),
    completedAt: iso(record.completedAt)
  };
}

function toEvidence(record: EvidenceRecord): EvidenceAsset {
  return {
    ...record,
    id: record._id.toString(),
    createdAt: iso(record.createdAt),
    retentionDate: record.retentionDate ? iso(record.retentionDate) : undefined
  };
}

function toComplaint(record: ComplaintRecord): Complaint {
  return {
    ...record,
    id: record._id.toString(),
    createdAt: iso(record.createdAt)
  };
}

function toWorkSession(record: WorkSessionRecord): WorkSession {
  return {
    ...record,
    id: record._id.toString(),
    startedAt: iso(record.startedAt),
    endedAt: record.endedAt ? iso(record.endedAt) : undefined
  };
}

function emptySavingsGoal(clerkUserId: string): SavingsGoal {
  return {
    id: "savings-empty",
    clerkUserId,
    title: "Set a savings goal",
    targetAmount: 0,
    currentAmount: 0,
    period: "monthly",
    safeSavingsPercentage: 10,
    deadline: new Date().toISOString(),
    contributionHistory: []
  };
}

function toSavingsGoal(record: SavingsGoalRecord | null, clerkUserId: string): SavingsGoal {
  if (!record) return emptySavingsGoal(clerkUserId);
  return {
    ...record,
    id: record._id.toString(),
    deadline: iso(record.deadline),
    contributionHistory: (record.contributionHistory ?? []).map((item) => ({ amount: item.amount, date: iso(item.date) }))
  };
}

function toNotification(record: NotificationRecord): Notification {
  return {
    ...record,
    id: record._id.toString(),
    createdAt: iso(record.createdAt)
  };
}

function toCommunityJob(record: CommunityJobRecord): CommunityJob {
  return {
    anonymousContributorId: record.anonymousContributorId,
    platform: record.platform,
    cityZone: record.cityZone,
    jobType: record.jobType,
    distanceBucket: record.distanceBucket,
    durationBucket: record.durationBucket,
    timeBand: record.timeBand,
    payout: record.payout,
    deductionAmount: record.deductionAmount,
    occurredAt: iso(record.occurredAt)
  };
}

export async function getProfile(clerkUserId: string): Promise<UserProfile> {
  await requireMongo();
  const record = (await UserProfileModel.findOne({ clerkUserId }).lean()) as unknown as (Partial<UserProfile> & MongoRecord) | null;
  return toProfile(record, clerkUserId);
}

export async function listJobs(clerkUserId: string): Promise<Job[]> {
  await requireMongo();
  const records = (await JobModel.find({ clerkUserId }).sort({ startedAt: -1 }).lean()) as unknown as JobRecord[];
  return records.map(toJob);
}

export async function getJob(clerkUserId: string, jobId: string): Promise<Job | null> {
  await requireMongo();
  const record = (await JobModel.findOne({ _id: jobId, clerkUserId }).lean()) as unknown as JobRecord | null;
  return record ? toJob(record) : null;
}

export async function saveJob(clerkUserId: string, input: Omit<Job, "id" | "clerkUserId" | "netPayout" | "reviewStatus"> & { reviewStatus?: Job["reviewStatus"] }) {
  await requireMongo();
  const record = await JobModel.create({
    ...input,
    clerkUserId,
    netPayout: input.grossPayout + input.tips + input.incentives - input.deductions,
    reviewStatus: input.reviewStatus ?? "confirmed",
    startedAt: new Date(input.startedAt),
    completedAt: new Date(input.completedAt)
  });
  return toJob(record.toObject() as JobRecord);
}

export async function deleteJob(clerkUserId: string, jobId: string) {
  await requireMongo();
  const result = await JobModel.deleteOne({ _id: jobId, clerkUserId });
  return result.deletedCount === 1;
}

export async function evaluateJob(clerkUserId: string, jobId: string) {
  const profile = await getProfile(clerkUserId);
  const job = await getJob(clerkUserId, jobId);
  if (!job) return null;
  return evaluateFairness({ job, profile, communityJobs: await listCommunityJobs() });
}

export async function listEvaluations(clerkUserId: string) {
  const [jobs, profile, communityJobs] = await Promise.all([listJobs(clerkUserId), getProfile(clerkUserId), listCommunityJobs()]);
  return jobs.map((job) => evaluateFairness({ job, profile, communityJobs }));
}

export async function getEvaluation(clerkUserId: string, jobId: string) {
  return (await listEvaluations(clerkUserId)).find((evaluation) => evaluation.jobId === jobId) ?? null;
}

export async function listEvidence(clerkUserId: string): Promise<EvidenceAsset[]> {
  await requireMongo();
  const records = (await EvidenceAssetModel.find({ clerkUserId }).sort({ createdAt: -1 }).lean()) as unknown as EvidenceRecord[];
  return records.map(toEvidence);
}

export async function saveEvidence(asset: EvidenceAsset) {
  await requireMongo();
  const record = await EvidenceAssetModel.create({
    ...asset,
    _id: undefined,
    retentionDate: asset.retentionDate ? new Date(asset.retentionDate) : undefined
  });
  return toEvidence(record.toObject() as EvidenceRecord);
}

export async function listComplaints(clerkUserId: string): Promise<Complaint[]> {
  await requireMongo();
  const records = (await ComplaintModel.find({ clerkUserId }).sort({ createdAt: -1 }).lean()) as unknown as ComplaintRecord[];
  return records.map(toComplaint);
}

export async function getComplaint(clerkUserId: string, complaintId: string) {
  await requireMongo();
  const record = (await ComplaintModel.findOne({ _id: complaintId, clerkUserId }).lean()) as unknown as ComplaintRecord | null;
  return record ? toComplaint(record) : null;
}

export async function saveComplaint(complaint: Complaint) {
  await requireMongo();
  const record = await ComplaintModel.create({ ...complaint, _id: undefined });
  return toComplaint(record.toObject() as ComplaintRecord);
}

export async function listWorkSessions(clerkUserId: string): Promise<WorkSession[]> {
  await requireMongo();
  const records = (await WorkSessionModel.find({ clerkUserId }).sort({ startedAt: -1 }).lean()) as unknown as WorkSessionRecord[];
  return records.map(toWorkSession);
}

export async function getSavingsGoal(clerkUserId: string): Promise<SavingsGoal> {
  await requireMongo();
  const record = (await SavingsGoalModel.findOne({ clerkUserId }).sort({ createdAt: -1 }).lean()) as unknown as SavingsGoalRecord | null;
  return toSavingsGoal(record, clerkUserId);
}

export async function listNotifications(clerkUserId: string): Promise<Notification[]> {
  await requireMongo();
  const records = (await NotificationModel.find({ clerkUserId }).sort({ createdAt: -1 }).lean()) as unknown as NotificationRecord[];
  return records.map(toNotification);
}

export async function listCommunityJobs(): Promise<CommunityJob[]> {
  await requireMongo();
  const records = (await CommunityJobModel.find({}).sort({ occurredAt: -1 }).limit(500).lean()) as unknown as CommunityJobRecord[];
  return records.map(toCommunityJob);
}

export async function addCommunityJob(sample: CommunityJob) {
  await requireMongo();
  const record = await CommunityJobModel.create({
    ...sample,
    occurredAt: new Date(sample.occurredAt)
  });
  return toCommunityJob(record.toObject() as CommunityJobRecord);
}
