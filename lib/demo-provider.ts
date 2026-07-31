import { evaluateFairness } from "@/lib/fairness";
import { scoreFatigue } from "@/lib/safety";
import type { AppRole } from "@/lib/auth";
import type { CommunityJob, Complaint, EvidenceAsset, Job, Notification, SavingsGoal, UserProfile, WorkSession } from "@/lib/types";

export const DEMO_WORKER_ID = "demo-worker";
export const DEMO_ADMIN_ID = "demo-admin";

const now = new Date("2026-07-31T10:30:00+05:30");
const iso = (daysAgo: number, hour: number, minute = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export function demoUserIdForRole(role: AppRole) {
  return role === "admin" ? DEMO_ADMIN_ID : DEMO_WORKER_ID;
}

export function isDemoUserId(clerkUserId: string) {
  return clerkUserId === DEMO_WORKER_ID || clerkUserId === DEMO_ADMIN_ID || clerkUserId.startsWith("demo-");
}

const demoGlobal = globalThis as typeof globalThis & {
  __gigshieldDemoJobs?: Map<string, Job>;
  __gigshieldDemoEvidence?: Map<string, EvidenceAsset>;
  __gigshieldDemoComplaints?: Map<string, Complaint>;
};

export const demoProfile: UserProfile = {
  id: "profile-demo-worker",
  clerkUserId: DEMO_WORKER_ID,
  displayName: "Demo Worker",
  preferredLanguage: "en",
  workerType: "food-delivery",
  city: "Bengaluru",
  vehicleType: "scooter",
  platformsUsed: ["Swiggy", "Zomato", "Blinkit", "Uber", "Rapido"],
  operatingCostPerKm: 2.8,
  hourlyEarningsFloor: 140,
  emergencyContacts: [],
  consent: {
    evidenceRetention: true,
    communityContribution: true,
    location: true,
    microphone: false,
    notifications: true
  },
  notificationPreferences: {
    weeklyInsight: true,
    fatigue: true,
    complaintFollowUp: true,
    unsafeWeather: true,
    savings: true
  },
  onboardingCompleted: true
};

const seededJobs: Job[] = [
    {
      id: "demo-job-101",
      clerkUserId: DEMO_WORKER_ID,
      platform: "Swiggy",
      jobType: "delivery",
      captureMethod: "screenshot",
      grossPayout: 118,
      baseFare: 25,
      incentives: 10,
      tips: 0,
      deductions: 16,
      unexplainedDeductions: 12,
      netPayout: 102,
      platformDistanceKm: 8.2,
      routeDistanceKm: 9.1,
      pickupDistanceKm: 1.4,
      activeMinutes: 34,
      waitingMinutes: 12,
      startedAt: iso(0, 8, 20),
      completedAt: iso(0, 9, 6),
      originArea: "Indiranagar",
      destinationArea: "Koramangala",
      tolls: 0,
      parking: 0,
      weatherCondition: "rain",
      nightJob: false,
      notes: "Demo screenshot extraction with a low-confidence deduction label.",
      evidenceAssetIds: ["demo-asset-1"],
      extraction: {
        provider: "claude",
        overallConfidence: 86,
        fieldConfidence: { grossPayout: 92, distanceKm: 88, deductions: 62 },
        warnings: ["Deduction reason is unclear."],
        visibleComponents: {
          baseFareVisible: true,
          distanceFareVisible: true,
          waitingFareVisible: false,
          incentiveVisible: true,
          deductionReasonVisible: false,
          taxVisible: false
        }
      },
      reviewStatus: "needs-review"
    },
    {
      id: "demo-job-102",
      clerkUserId: DEMO_WORKER_ID,
      platform: "Zomato",
      jobType: "delivery",
      captureMethod: "manual",
      grossPayout: 176,
      baseFare: 30,
      incentives: 25,
      tips: 20,
      deductions: 0,
      unexplainedDeductions: 0,
      netPayout: 176,
      platformDistanceKm: 6.4,
      routeDistanceKm: 6.6,
      pickupDistanceKm: 0.8,
      activeMinutes: 29,
      waitingMinutes: 6,
      startedAt: iso(0, 11, 15),
      completedAt: iso(0, 11, 50),
      originArea: "HSR Layout",
      destinationArea: "BTM Layout",
      tolls: 0,
      parking: 0,
      weatherCondition: "clear",
      nightJob: false,
      notes: "",
      evidenceAssetIds: [],
      reviewStatus: "confirmed"
    }
];

const demoJobs = (demoGlobal.__gigshieldDemoJobs ??= new Map<string, Job>(seededJobs.map((job) => [job.id, job])));

const seededEvidence: Array<[string, EvidenceAsset]> = [
  [
    "demo-asset-1",
    {
      id: "demo-asset-1",
      clerkUserId: DEMO_WORKER_ID,
      jobId: "demo-job-101",
      objectKey: "demo/screenshots/swiggy-payout.png",
      originalFileName: "swiggy-payout.png",
      mimeType: "image/png",
      size: 120000,
      category: "screenshot",
      retainedWithConsent: true,
      createdAt: iso(0, 9)
    }
  ]
];

const demoEvidence = (demoGlobal.__gigshieldDemoEvidence ??= new Map<string, EvidenceAsset>(seededEvidence));

const demoCommunityJobs: CommunityJob[] = Array.from({ length: 36 }, (_, index) => ({
  anonymousContributorId: `anon-${index % 12}`,
  platform: ["Swiggy", "Zomato", "Blinkit", "Uber", "Ola", "Rapido"][index % 6] as CommunityJob["platform"],
  cityZone: ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield"][index % 4],
  jobType: index % 3 === 0 ? "ride" : "delivery",
  distanceBucket: ["0-3 km", "3-6 km", "6-10 km"][index % 3],
  durationBucket: ["0-20 min", "20-40 min", "40-60 min"][index % 3],
  timeBand: ["morning", "midday", "evening"][index % 3],
  payout: 80 + (index % 8) * 12,
  deductionAmount: index % 5 === 0 ? 10 : 0,
  occurredAt: iso(index % 10, 10)
}));

const seededComplaints: Array<[string, Complaint]> = [
  [
    "demo-complaint-1",
    {
      id: "demo-complaint-1",
      clerkUserId: DEMO_WORKER_ID,
      jobIds: ["demo-job-101"],
      type: "unexplained-deduction",
      tone: "formal",
      subject: "Request for deduction explanation",
      body: "Please review job demo-job-101 and provide the calculation basis for the unclear deduction. [Please add platform ticket number].",
      requestedRemedy: "Explain and reverse any unsupported deduction.",
      status: "draft",
      attachmentAssetIds: ["demo-asset-1"],
      generatedByClaude: false,
      createdAt: iso(0, 16)
    }
  ]
];

const demoComplaints = (demoGlobal.__gigshieldDemoComplaints ??= new Map<string, Complaint>(seededComplaints));

const demoSessions: WorkSession[] = [
  {
    id: "demo-session-1",
    clerkUserId: DEMO_WORKER_ID,
    startedAt: iso(0, 7, 55),
    activeMinutes: 318,
    breakMinutes: 18,
    distanceKm: 46,
    jobsCompleted: 6,
    fatigueScore: 0
  }
].map((session) => ({ ...session, fatigueScore: scoreFatigue(session) }));

const demoSavingsGoal: SavingsGoal = {
  id: "demo-goal-1",
  clerkUserId: DEMO_WORKER_ID,
  title: "Scooter service buffer",
  targetAmount: 6000,
  currentAmount: 2350,
  period: "monthly",
  safeSavingsPercentage: 12,
  deadline: "2026-08-31",
  contributionHistory: []
};

const demoNotifications: Notification[] = [
  {
    id: "demo-notice-1",
    clerkUserId: DEMO_WORKER_ID,
    type: "fatigue",
    title: "Break suggested",
    body: "You have worked more than five hours with a short break.",
    deepLink: "/dashboard",
    isRead: false,
    sensitive: false,
    createdAt: iso(0, 14)
  }
];

export function getDemoProfile(clerkUserId: string): UserProfile {
  return { ...demoProfile, clerkUserId, displayName: clerkUserId === DEMO_ADMIN_ID ? "Demo Admin" : "Demo Worker" };
}

export function listDemoJobs(clerkUserId: string) {
  return [...demoJobs.values()].filter((job) => job.clerkUserId === DEMO_WORKER_ID || job.clerkUserId === clerkUserId);
}

export function getDemoJob(clerkUserId: string, jobId: string) {
  const job = demoJobs.get(jobId);
  return job && (job.clerkUserId === DEMO_WORKER_ID || job.clerkUserId === clerkUserId) ? job : null;
}

export function saveDemoJob(clerkUserId: string, input: Omit<Job, "id" | "clerkUserId" | "netPayout" | "reviewStatus"> & { reviewStatus?: Job["reviewStatus"] }) {
  const id = `demo-job-${Date.now()}`;
  const job: Job = {
    ...input,
    id,
    clerkUserId,
    netPayout: input.grossPayout + input.tips + input.incentives - input.deductions,
    reviewStatus: input.reviewStatus ?? "confirmed"
  };
  demoJobs.set(id, job);
  return job;
}

export function listDemoEvaluations(clerkUserId: string) {
  const profile = getDemoProfile(clerkUserId);
  return listDemoJobs(clerkUserId).map((job) => evaluateFairness({ job, profile, communityJobs: demoCommunityJobs }));
}

export function listDemoEvidence(clerkUserId: string) {
  return [...demoEvidence.values()].filter((asset) => asset.clerkUserId === DEMO_WORKER_ID || asset.clerkUserId === clerkUserId);
}

export function saveDemoEvidence(asset: EvidenceAsset) {
  demoEvidence.set(asset.id, asset);
  return asset;
}

export function listDemoComplaints(clerkUserId: string) {
  return [...demoComplaints.values()].filter((complaint) => complaint.clerkUserId === DEMO_WORKER_ID || complaint.clerkUserId === clerkUserId);
}

export function getDemoComplaint(clerkUserId: string, complaintId: string) {
  const complaint = demoComplaints.get(complaintId);
  return complaint && (complaint.clerkUserId === DEMO_WORKER_ID || complaint.clerkUserId === clerkUserId) ? complaint : null;
}

export function saveDemoComplaint(complaint: Complaint) {
  demoComplaints.set(complaint.id, complaint);
  return complaint;
}

export function listDemoWorkSessions() {
  return demoSessions;
}

export function getDemoSavingsGoal(clerkUserId: string) {
  return { ...demoSavingsGoal, clerkUserId };
}

export function listDemoNotifications(clerkUserId: string) {
  return demoNotifications.map((notification) => ({ ...notification, clerkUserId }));
}

export function listDemoCommunityJobs() {
  return demoCommunityJobs;
}

export function addDemoCommunityJob(sample: CommunityJob) {
  demoCommunityJobs.push(sample);
  return sample;
}
