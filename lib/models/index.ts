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
    occurredAt: Date
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
    occurredAt: Date
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

export const UserProfileModel = mongoose.models.UserProfile ?? mongoose.model("UserProfile", userProfileSchema);
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
