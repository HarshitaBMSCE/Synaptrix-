import { evaluateFairness } from "@/lib/fairness";
import { scoreFatigue } from "@/lib/safety";
import type {
  CommunityJob,
  Complaint,
  EvidenceAsset,
  Job,
  Notification,
  Platform,
  SavingsGoal,
  UserProfile,
  WorkSession
} from "@/lib/types";

export const DEMO_USER_ID = "demo-worker-bengaluru";

export const demoProfile: UserProfile = {
  id: "profile-demo",
  clerkUserId: DEMO_USER_ID,
  displayName: "Asha Kumar",
  phone: "+91 90000 00000",
  preferredLanguage: "en",
  workerType: "food-delivery",
  city: "Bengaluru",
  vehicleType: "scooter",
  platformsUsed: ["Swiggy", "Zomato", "Blinkit", "Uber", "Rapido"],
  operatingCostPerKm: 2.8,
  hourlyEarningsFloor: 140,
  emergencyContacts: [{ name: "Nisha", phone: "+91 98888 11111", relationship: "Sister" }],
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

const now = new Date("2026-07-31T10:30:00+05:30");
const iso = (daysAgo: number, hour: number, minute = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const demoJobs: Job[] = [
  {
    id: "job-101",
    clerkUserId: DEMO_USER_ID,
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
    notes: "Deduction reason not visible in app screenshot.",
    evidenceAssetIds: ["asset-1"],
    extraction: {
      provider: "demo",
      overallConfidence: 86,
      fieldConfidence: { payout: 94, distance: 88, deduction: 67, time: 82 },
      warnings: ["Deduction label low confidence", "Waiting fare not visible"],
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
    id: "job-102",
    clerkUserId: DEMO_USER_ID,
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
    notes: "Customer tip included.",
    evidenceAssetIds: [],
    reviewStatus: "confirmed"
  },
  {
    id: "job-103",
    clerkUserId: DEMO_USER_ID,
    platform: "Blinkit",
    jobType: "delivery",
    captureMethod: "voice",
    grossPayout: 92,
    baseFare: 22,
    incentives: 0,
    tips: 0,
    deductions: 9,
    unexplainedDeductions: 9,
    netPayout: 83,
    platformDistanceKm: 4.5,
    routeDistanceKm: 5.2,
    pickupDistanceKm: 1,
    activeMinutes: 27,
    waitingMinutes: 11,
    startedAt: iso(0, 13, 40),
    completedAt: iso(0, 14, 18),
    originArea: "Jayanagar",
    destinationArea: "JP Nagar",
    tolls: 0,
    parking: 0,
    weatherCondition: "clear",
    nightJob: false,
    notes: "Voice entry parsed from rider note.",
    evidenceAssetIds: [],
    reviewStatus: "confirmed"
  },
  {
    id: "job-104",
    clerkUserId: DEMO_USER_ID,
    platform: "Uber",
    jobType: "ride",
    captureMethod: "manual",
    grossPayout: 320,
    baseFare: 45,
    incentives: 35,
    tips: 0,
    deductions: 22,
    unexplainedDeductions: 0,
    netPayout: 298,
    platformDistanceKm: 13.5,
    routeDistanceKm: 13.1,
    pickupDistanceKm: 2.3,
    activeMinutes: 52,
    waitingMinutes: 4,
    startedAt: iso(1, 22, 45),
    completedAt: iso(1, 23, 38),
    originArea: "MG Road",
    destinationArea: "Yelahanka",
    tolls: 0,
    parking: 20,
    weatherCondition: "clear",
    nightJob: true,
    notes: "Late ride after airport drop cluster.",
    evidenceAssetIds: [],
    reviewStatus: "confirmed"
  },
  {
    id: "job-105",
    clerkUserId: DEMO_USER_ID,
    platform: "Rapido",
    jobType: "ride",
    captureMethod: "manual",
    grossPayout: 142,
    baseFare: 28,
    incentives: 0,
    tips: 0,
    deductions: 18,
    unexplainedDeductions: 6,
    netPayout: 124,
    platformDistanceKm: 7.1,
    routeDistanceKm: 8.4,
    pickupDistanceKm: 1.8,
    activeMinutes: 38,
    waitingMinutes: 7,
    startedAt: iso(2, 18, 5),
    completedAt: iso(2, 18, 50),
    originArea: "Whitefield",
    destinationArea: "Mahadevapura",
    tolls: 0,
    parking: 0,
    weatherCondition: "heavy-rain",
    nightJob: false,
    notes: "Rain peak demand, no visible rain bonus.",
    evidenceAssetIds: [],
    reviewStatus: "confirmed"
  }
];

const platforms: Platform[] = ["Swiggy", "Zomato", "Blinkit", "Uber", "Ola", "Rapido"];
const zones = ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Jayanagar", "MG Road"];
const distanceBuckets = ["0-3 km", "3-6 km", "6-10 km", "10+ km"];
const durationBuckets = ["0-20 min", "20-40 min", "40-60 min", "60+ min"];
const timeBands = ["morning", "midday", "evening", "night", "late-night"];

export const demoCommunityJobs: CommunityJob[] = Array.from({ length: 180 }, (_, index) => {
  const platform = platforms[index % platforms.length];
  const distanceBucket = distanceBuckets[index % distanceBuckets.length];
  const durationBucket = durationBuckets[Math.floor(index / 2) % durationBuckets.length];
  const timeBand = timeBands[Math.floor(index / 3) % timeBands.length];
  const base = 65 + (index % 7) * 9 + distanceBuckets.indexOf(distanceBucket) * 24 + durationBuckets.indexOf(durationBucket) * 12;
  const platformLift = platform === "Uber" || platform === "Ola" ? 75 : platform === "Zomato" ? 18 : 0;
  return {
    anonymousContributorId: `anon-${index % 37}`,
    platform,
    cityZone: zones[index % zones.length],
    jobType: platform === "Uber" || platform === "Ola" || platform === "Rapido" ? "ride" : "delivery",
    distanceBucket,
    durationBucket,
    timeBand,
    payout: base + platformLift,
    deductionAmount: index % 5 === 0 ? 12 : index % 7,
    occurredAt: iso(index % 21, 10 + (index % 12))
  };
});

export const demoEvidence: EvidenceAsset[] = [
  {
    id: "asset-1",
    clerkUserId: DEMO_USER_ID,
    jobId: "job-101",
    objectKey: "demo/evidence/swiggy-rain-deduction.png",
    originalFileName: "swiggy-rain-deduction.png",
    mimeType: "image/png",
    size: 384000,
    checksum: "demo-checksum",
    category: "screenshot",
    retainedWithConsent: true,
    retentionDate: "2026-10-31",
    createdAt: iso(0, 9, 8)
  }
];

export const demoSessions: WorkSession[] = [
  {
    id: "session-1",
    clerkUserId: DEMO_USER_ID,
    startedAt: iso(0, 7, 55),
    activeMinutes: 318,
    breakMinutes: 18,
    distanceKm: 46,
    jobsCompleted: 6,
    fatigueScore: 0
  }
].map((session) => ({ ...session, fatigueScore: scoreFatigue(session) }));

export const demoSavingsGoal: SavingsGoal = {
  id: "goal-1",
  clerkUserId: DEMO_USER_ID,
  title: "Scooter service buffer",
  targetAmount: 6000,
  currentAmount: 2350,
  period: "monthly",
  safeSavingsPercentage: 12,
  deadline: "2026-08-31",
  contributionHistory: [
    { amount: 400, date: iso(4, 21) },
    { amount: 350, date: iso(2, 20) },
    { amount: 250, date: iso(0, 16) }
  ]
};

export const demoComplaints: Complaint[] = [
  {
    id: "complaint-1",
    clerkUserId: DEMO_USER_ID,
    jobIds: ["job-101", "job-103"],
    type: "unexplained-deduction",
    tone: "formal",
    subject: "Request for explanation and reversal of unexplained deductions",
    body:
      "Please review the attached job records and provide the deduction calculation basis. The GigShield benchmark estimates a payment gap on the selected jobs. [Please add platform ticket number].",
    requestedRemedy: "Explain the deductions and reverse any unsupported amount.",
    status: "draft",
    attachmentAssetIds: ["asset-1"],
    generatedByClaude: false,
    createdAt: iso(0, 16)
  }
];

export const demoNotifications: Notification[] = [
  {
    id: "notice-1",
    clerkUserId: DEMO_USER_ID,
    type: "fatigue",
    title: "Break suggested",
    body: "You have worked more than five hours with a short break. Consider pausing before the next long route.",
    deepLink: "/dashboard",
    isRead: false,
    sensitive: false,
    createdAt: iso(0, 14)
  },
  {
    id: "notice-2",
    clerkUserId: DEMO_USER_ID,
    type: "complaint",
    title: "Complaint draft ready",
    body: "A draft for unexplained deductions is waiting for review.",
    deepLink: "/complaints/complaint-1",
    isRead: false,
    sensitive: true,
    createdAt: iso(0, 16)
  }
];

export const demoEvaluations = demoJobs.map((job) =>
  evaluateFairness({
    job,
    profile: demoProfile,
    communityJobs: demoCommunityJobs
  })
);
