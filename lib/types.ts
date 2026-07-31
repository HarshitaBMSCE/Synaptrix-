export type Language = "en" | "hi" | "kn";

export type WorkerType =
  | "food-delivery"
  | "grocery-delivery"
  | "cab-driver"
  | "bike-taxi"
  | "courier"
  | "home-service";

export type Platform = "Swiggy" | "Zomato" | "Blinkit" | "Uber" | "Ola" | "Rapido";

export type JobType = "delivery" | "ride" | "courier" | "service";

export type CaptureMethod = "manual" | "screenshot" | "voice";

export type Verdict = "Fair" | "Slightly underpaid" | "Underpaid" | "Severely underpaid" | "Insufficient data";

export type UserProfile = {
  id: string;
  clerkUserId: string;
  displayName: string;
  phone?: string;
  preferredLanguage: Language;
  workerType: WorkerType;
  city: string;
  vehicleType: "bike" | "scooter" | "car" | "cycle";
  platformsUsed: Platform[];
  operatingCostPerKm: number;
  hourlyEarningsFloor: number;
  emergencyContacts: EmergencyContact[];
  consent: {
    evidenceRetention: boolean;
    communityContribution: boolean;
    location: boolean;
    microphone: boolean;
    notifications: boolean;
  };
  notificationPreferences: Record<string, boolean>;
  onboardingCompleted: boolean;
};

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};

export type Job = {
  id: string;
  clerkUserId: string;
  platform: Platform;
  jobType: JobType;
  captureMethod: CaptureMethod;
  grossPayout: number;
  baseFare: number;
  incentives: number;
  tips: number;
  deductions: number;
  unexplainedDeductions: number;
  netPayout: number;
  platformDistanceKm: number;
  routeDistanceKm: number;
  pickupDistanceKm: number;
  activeMinutes: number;
  waitingMinutes: number;
  startedAt: string;
  completedAt: string;
  originArea: string;
  destinationArea: string;
  tolls: number;
  parking: number;
  weatherCondition: "clear" | "rain" | "heavy-rain";
  nightJob: boolean;
  notes: string;
  evidenceAssetIds: string[];
  extraction?: ExtractionMetadata;
  reviewStatus: "draft" | "needs-review" | "confirmed";
};

export type ExtractionMetadata = {
  provider: "claude" | "manual";
  overallConfidence: number;
  fieldConfidence: Record<string, number>;
  warnings: string[];
  visibleComponents: VisibleFareComponents;
};

export type VisibleFareComponents = {
  baseFareVisible: boolean;
  distanceFareVisible: boolean;
  waitingFareVisible: boolean;
  incentiveVisible: boolean;
  deductionReasonVisible: boolean;
  taxVisible: boolean;
};

export type EvidenceAsset = {
  id: string;
  clerkUserId: string;
  jobId?: string;
  objectKey: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  checksum?: string;
  category: "screenshot" | "complaint" | "weekly-report" | "other";
  retainedWithConsent: boolean;
  retentionDate?: string;
  createdAt: string;
};

export type FairnessEvaluation = {
  id: string;
  clerkUserId: string;
  jobId: string;
  benchmarkVersion: string;
  assumptions: Record<string, number | string | boolean>;
  formulaExpectedGross: number;
  estimatedOperatingCost: number;
  formulaExpectedNet: number;
  communityMedian?: number;
  communitySampleSize: number;
  expectedNet: number;
  farePaymentScore: number;
  deductionScore: number;
  distanceAccuracyScore: number;
  transparencyScore: number;
  finalFairnessScore: number;
  confidenceScore: number;
  verdict: Verdict;
  estimatedGap: number;
  explanationFactors: string[];
  createdAt: string;
};

export type CommunityJob = {
  anonymousContributorId: string;
  platform: Platform;
  cityZone: string;
  jobType: JobType;
  distanceBucket: string;
  durationBucket: string;
  timeBand: string;
  payout: number;
  deductionAmount: number;
  occurredAt: string;
};

export type Complaint = {
  id: string;
  clerkUserId: string;
  jobIds: string[];
  type: "underpayment" | "unexplained-deduction" | "delayed-payout" | "unsafe-condition" | "deactivation" | "missing-grievance";
  tone: "concise" | "formal" | "escalation";
  subject: string;
  body: string;
  requestedRemedy: string;
  status: "draft" | "saved" | "exported";
  attachmentAssetIds: string[];
  generatedByClaude: boolean;
  createdAt: string;
};

export type WorkSession = {
  id: string;
  clerkUserId: string;
  startedAt: string;
  endedAt?: string;
  activeMinutes: number;
  breakMinutes: number;
  distanceKm: number;
  jobsCompleted: number;
  fatigueScore: number;
};

export type SavingsGoal = {
  id: string;
  clerkUserId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  period: "weekly" | "monthly";
  safeSavingsPercentage: number;
  deadline: string;
  contributionHistory: Array<{ amount: number; date: string }>;
};

export type Notification = {
  id: string;
  clerkUserId: string;
  type: string;
  title: string;
  body: string;
  deepLink: string;
  isRead: boolean;
  sensitive: boolean;
  createdAt: string;
};

export type Coordinate = [longitude: number, latitude: number];

export type RouteOption = {
  id: string;
  name: string;
  distanceKm: number;
  distanceMeters: number;
  etaMinutes: number;
  durationSeconds: number;
  geometry: {
    type: "LineString";
    coordinates: Coordinate[];
  } | null;
  summary: string;
  origin: {
    label: string;
    coordinate: Coordinate | null;
  };
  destination: {
    label: string;
    coordinate: Coordinate | null;
  };
  provider: "openrouteservice" | "deterministic-fallback";
  fallbackReason?: string;
  safetyScore: number;
  classification: "Lower risk" | "Moderate risk" | "High risk" | "Very high risk";
  riskFactors: string[];
  weather: string;
  fastest: boolean;
  recommended: boolean;
};
