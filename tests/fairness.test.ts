import { describe, expect, it } from "vitest";
import { evaluateFairness } from "@/lib/fairness";
import type { CommunityJob, Job, UserProfile } from "@/lib/types";

const testUserId = "test-worker";

const profile: UserProfile = {
  id: "profile-test",
  clerkUserId: testUserId,
  displayName: "Test worker",
  preferredLanguage: "en",
  workerType: "food-delivery",
  city: "Bengaluru",
  vehicleType: "scooter",
  platformsUsed: ["Swiggy"],
  operatingCostPerKm: 2.8,
  hourlyEarningsFloor: 140,
  emergencyContacts: [],
  consent: {
    evidenceRetention: false,
    communityContribution: false,
    location: false,
    microphone: false,
    notifications: false
  },
  notificationPreferences: {},
  onboardingCompleted: false
};

const baseJob: Job = {
  id: "test-job",
  clerkUserId: testUserId,
  platform: "Swiggy",
  jobType: "delivery",
  captureMethod: "manual",
  grossPayout: 180,
  baseFare: 25,
  incentives: 0,
  tips: 0,
  deductions: 0,
  unexplainedDeductions: 0,
  netPayout: 180,
  platformDistanceKm: 5,
  routeDistanceKm: 5,
  pickupDistanceKm: 1,
  activeMinutes: 30,
  waitingMinutes: 5,
  startedAt: "2026-07-31T08:00:00.000Z",
  completedAt: "2026-07-31T08:35:00.000Z",
  originArea: "Indiranagar",
  destinationArea: "Koramangala",
  tolls: 0,
  parking: 0,
  weatherCondition: "clear",
  nightJob: false,
  notes: "",
  evidenceAssetIds: [],
  reviewStatus: "confirmed"
};

describe("fairness engine", () => {
  it("scores a fair job", () => {
    const evaluation = evaluateFairness({ job: baseJob, profile, communityJobs: [] });
    expect(evaluation.verdict).toBe("Fair");
    expect(evaluation.finalFairnessScore).toBeGreaterThanOrEqual(85);
  });

  it("flags an underpaid job", () => {
    const evaluation = evaluateFairness({ job: { ...baseJob, netPayout: 40, grossPayout: 40 }, profile, communityJobs: [] });
    expect(evaluation.verdict).toMatch(/Underpaid|Severely/);
    expect(evaluation.estimatedGap).toBeGreaterThan(0);
  });

  it("penalizes excessive unexplained deduction", () => {
    const evaluation = evaluateFairness({
      job: { ...baseJob, deductions: 50, unexplainedDeductions: 50, grossPayout: 160, netPayout: 110 },
      profile,
      communityJobs: []
    });
    expect(evaluation.deductionScore).toBeLessThan(50);
  });

  it("penalizes distance mismatch", () => {
    const evaluation = evaluateFairness({ job: { ...baseJob, platformDistanceKm: 4, routeDistanceKm: 8 }, profile, communityJobs: [] });
    expect(evaluation.distanceAccuracyScore).toBe(50);
  });

  it("blends reliable community benchmark", () => {
    const community: CommunityJob[] = Array.from({ length: 6 }, (_, index) => ({
      anonymousContributorId: `anon-${index}`,
      platform: "Swiggy" as const,
      cityZone: "Indiranagar",
      jobType: "delivery" as const,
      distanceBucket: "3-6 km",
      durationBucket: "20-40 min",
      timeBand: "midday",
      payout: 60,
      deductionAmount: 0,
      occurredAt: "2026-07-25T10:00:00.000Z"
    }));
    const evaluation = evaluateFairness({ job: baseJob, profile, communityJobs: community });
    expect(evaluation.communitySampleSize).toBe(6);
    expect(evaluation.expectedNet).toBeLessThan(evaluation.formulaExpectedNet);
  });

  it("returns insufficient data for missing required data", () => {
    const evaluation = evaluateFairness({ job: { ...baseJob, activeMinutes: 0 }, profile, communityJobs: [] });
    expect(evaluation.verdict).toBe("Insufficient data");
  });

  it("clamps high scores", () => {
    const evaluation = evaluateFairness({ job: { ...baseJob, netPayout: 9999, grossPayout: 9999 }, profile, communityJobs: [] });
    expect(evaluation.farePaymentScore).toBe(100);
    expect(evaluation.finalFairnessScore).toBeLessThanOrEqual(100);
  });

  it("handles zero-value edge cases", () => {
    const evaluation = evaluateFairness({
      job: { ...baseJob, grossPayout: 0, netPayout: 0, unexplainedDeductions: 0, platformDistanceKm: 0, routeDistanceKm: 0.1 },
      profile,
      communityJobs: []
    });
    expect(Number.isFinite(evaluation.finalFairnessScore)).toBe(true);
  });
});
