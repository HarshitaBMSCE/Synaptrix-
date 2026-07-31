import mongoose, { Schema } from "mongoose";

const consentSchema = new Schema(
  {
    evidenceRetention: Boolean,
    communityContribution: Boolean,
    location: Boolean,
    microphone: Boolean,
    notifications: Boolean
  },
  { _id: false }
);

const emergencyContactSchema = new Schema(
  {
    name: String,
    phone: String,
    relationship: String
  },
  { _id: false }
);

const userProfileSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true, unique: true },
    role: { type: String, enum: ["worker", "admin"], default: "worker", index: true },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
    displayName: String,
    phone: String,
    preferredLanguage: { type: String, enum: ["en", "hi", "kn"], default: "en" },
    workerType: String,
    city: String,
    vehicleType: String,
    platformsUsed: [String],
    operatingCostPerKm: Number,
    hourlyEarningsFloor: Number,
    emergencyContacts: [emergencyContactSchema],
    consent: consentSchema,
    notificationPreferences: Schema.Types.Mixed,
    onboardingCompleted: Boolean
  },
  { timestamps: true }
);

const jobSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    platform: String,
    jobType: String,
    captureMethod: { type: String, enum: ["manual", "screenshot", "voice"] },
    grossPayout: Number,
    baseFare: Number,
    incentives: Number,
    tips: Number,
    deductions: Number,
    unexplainedDeductions: Number,
    netPayout: Number,
    platformDistanceKm: Number,
    routeDistanceKm: Number,
    pickupDistanceKm: Number,
    activeMinutes: Number,
    waitingMinutes: Number,
    startedAt: Date,
    completedAt: Date,
    originArea: String,
    destinationArea: String,
    tolls: Number,
    parking: Number,
    weatherCondition: String,
    nightJob: Boolean,
    notes: String,
    evidenceAssetIds: [String],
    extraction: Schema.Types.Mixed,
    reviewStatus: String
  },
  { timestamps: true }
);

const evidenceAssetSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    jobId: String,
    objectKey: { type: String, required: true },
    originalFileName: String,
    mimeType: String,
    size: Number,
    checksum: String,
    category: String,
    retainedWithConsent: Boolean,
    retentionDate: Date
  },
  { timestamps: true }
);

const fairnessEvaluationSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    jobId: { type: String, required: true, index: true },
    benchmarkVersion: String,
    assumptions: Schema.Types.Mixed,
    formulaExpectedGross: Number,
    estimatedOperatingCost: Number,
    formulaExpectedNet: Number,
    communityMedian: Number,
    communitySampleSize: Number,
    expectedNet: Number,
    farePaymentScore: Number,
    deductionScore: Number,
    distanceAccuracyScore: Number,
    transparencyScore: Number,
    finalFairnessScore: Number,
    confidenceScore: Number,
    verdict: String,
    estimatedGap: Number,
    explanationFactors: [String]
  },
  { timestamps: true }
);

const communityJobSchema = new Schema(
  {
    anonymousContributorId: { type: String, index: true },
    platform: String,
    cityZone: String,
    jobType: String,
    distanceBucket: String,
    durationBucket: String,
    timeBand: String,
    payout: Number,
    deductionAmount: Number,
    occurredAt: Date,
    moderationStatus: { type: String, enum: ["pending", "approved", "rejected", "outlier", "duplicate"], default: "pending", index: true },
    moderatedBy: String,
    moderatedAt: Date
  },
  { timestamps: true }
);

const complaintSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    jobIds: [String],
    type: String,
    tone: String,
    subject: String,
    body: String,
    requestedRemedy: String,
    status: String,
    attachmentAssetIds: [String],
    generatedByClaude: Boolean
  },
  { timestamps: true }
);

const workSessionSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    startedAt: Date,
    endedAt: Date,
    activeMinutes: Number,
    breakMinutes: Number,
    distanceKm: Number,
    jobsCompleted: Number,
    fatigueScore: Number
  },
  { timestamps: true }
);

const incidentSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    routeId: String,
    category: String,
    approximateLocation: String,
    description: String,
    visibility: { type: String, enum: ["private", "community"] },
    occurredAt: Date,
    moderationStatus: { type: String, enum: ["pending", "approved", "rejected", "resolved"], default: "pending", index: true },
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    moderatedBy: String,
    moderatedAt: Date
  },
  { timestamps: true }
);

const platformSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: String,
    iconRef: String,
    supportedJobTypes: [String],
    active: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 100 },
    benchmarkAvailable: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const benchmarkConfigurationSchema = new Schema(
  {
    version: { type: String, required: true, index: true },
    baseFare: Number,
    paidDeliveryDistancePerKm: Number,
    pickupAllowancePerKm: Number,
    activeTimeAllowancePerMinute: Number,
    waitingAllowancePerMinute: Number,
    rainBonus: Number,
    nightPremiumRate: Number,
    defaultOperatingCostPerKm: Number,
    minimumHourlyEarningFloor: Number,
    platformOverrides: Schema.Types.Mixed,
    effectiveDate: Date,
    notes: String,
    createdBy: String
  },
  { timestamps: true }
);

const rightsSnippetSchema = new Schema(
  {
    theme: String,
    jurisdiction: String,
    snippet: String,
    sourceTitle: String,
    reference: String,
    enabled: { type: Boolean, default: true },
    translations: Schema.Types.Mixed,
    disclaimer: String
  },
  { timestamps: true }
);

const savingsGoalSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    title: String,
    targetAmount: Number,
    currentAmount: Number,
    period: String,
    safeSavingsPercentage: Number,
    deadline: Date,
    contributionHistory: [{ amount: Number, date: Date }]
  },
  { timestamps: true }
);

const notificationSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    type: String,
    title: String,
    body: String,
    deepLink: String,
    isRead: Boolean,
    sensitive: Boolean
  },
  { timestamps: true }
);

const pushSubscriptionSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    endpoint: String,
    keys: Schema.Types.Mixed
  },
  { timestamps: true }
);

const auditLogSchema = new Schema(
  {
    actorClerkUserId: { type: String, required: true, index: true },
    actorRole: { type: String, enum: ["worker", "admin"], required: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: String,
    metadata: Schema.Types.Mixed,
    reason: String,
    requestId: String
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const UserProfileModel = mongoose.models.UserProfile ?? mongoose.model("UserProfile", userProfileSchema);
export const PlatformModel = mongoose.models.Platform ?? mongoose.model("Platform", platformSchema);
export const BenchmarkConfigurationModel =
  mongoose.models.BenchmarkConfiguration ?? mongoose.model("BenchmarkConfiguration", benchmarkConfigurationSchema);
export const JobModel = mongoose.models.Job ?? mongoose.model("Job", jobSchema);
export const EvidenceAssetModel = mongoose.models.EvidenceAsset ?? mongoose.model("EvidenceAsset", evidenceAssetSchema);
export const FairnessEvaluationModel =
  mongoose.models.FairnessEvaluation ?? mongoose.model("FairnessEvaluation", fairnessEvaluationSchema);
export const CommunityJobModel = mongoose.models.CommunityJob ?? mongoose.model("CommunityJob", communityJobSchema);
export const ComplaintModel = mongoose.models.Complaint ?? mongoose.model("Complaint", complaintSchema);
export const WorkSessionModel = mongoose.models.WorkSession ?? mongoose.model("WorkSession", workSessionSchema);
export const IncidentModel = mongoose.models.Incident ?? mongoose.model("Incident", incidentSchema);
export const SavingsGoalModel = mongoose.models.SavingsGoal ?? mongoose.model("SavingsGoal", savingsGoalSchema);
export const NotificationModel = mongoose.models.Notification ?? mongoose.model("Notification", notificationSchema);
export const PushSubscriptionModel = mongoose.models.PushSubscription ?? mongoose.model("PushSubscription", pushSubscriptionSchema);
export const RightsSnippetModel = mongoose.models.RightsSnippet ?? mongoose.model("RightsSnippet", rightsSnippetSchema);
export const AuditLogModel = mongoose.models.AuditLog ?? mongoose.model("AuditLog", auditLogSchema);
