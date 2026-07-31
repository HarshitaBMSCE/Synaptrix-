import type { CommunityJob, FairnessEvaluation, Job, UserProfile, Verdict, VisibleFareComponents } from "@/lib/types";

export const bengaluruBenchmark = {
  version: "bengaluru-2026-07",
  baseFare: 25,
  paidDeliveryDistancePerKm: 8,
  pickupAllowancePerKm: 4,
  activeTimeAllowancePerMinute: 1,
  waitingAllowancePerMinute: 1.5,
  nightPremiumRate: 0.1,
  rainBonus: 15,
  defaultOperatingCostPerKm: 2.5,
  minimumHourlyEarningFloor: 120,
  reliableCommunitySampleSize: 5
};

const round = (value: number) => Math.round(value * 100) / 100;
export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

function verdictFor(score: number): Verdict {
  if (!Number.isFinite(score)) return "Insufficient data";
  if (score >= 85) return "Fair";
  if (score >= 70) return "Slightly underpaid";
  if (score >= 50) return "Underpaid";
  return "Severely underpaid";
}

function transparencyScore(visible: VisibleFareComponents): number {
  return (
    (visible.baseFareVisible ? 20 : 0) +
    (visible.distanceFareVisible ? 20 : 0) +
    (visible.waitingFareVisible ? 15 : 0) +
    (visible.incentiveVisible ? 15 : 0) +
    (visible.deductionReasonVisible ? 20 : 0) +
    (visible.taxVisible ? 10 : 0)
  );
}

export function bucketDistance(distanceKm: number) {
  if (distanceKm <= 3) return "0-3 km";
  if (distanceKm <= 6) return "3-6 km";
  if (distanceKm <= 10) return "6-10 km";
  return "10+ km";
}

export function bucketDuration(minutes: number) {
  if (minutes <= 20) return "0-20 min";
  if (minutes <= 40) return "20-40 min";
  if (minutes <= 60) return "40-60 min";
  return "60+ min";
}

export function timeBand(isoDate: string) {
  const hour = new Date(isoDate).getHours();
  if (hour < 6) return "late-night";
  if (hour < 11) return "morning";
  if (hour < 16) return "midday";
  if (hour < 21) return "evening";
  return "night";
}

export function communityStats(job: Job, communityJobs: CommunityJob[]) {
  const matches = communityJobs.filter(
    (sample) =>
      sample.platform === job.platform &&
      sample.jobType === job.jobType &&
      sample.distanceBucket === bucketDistance(job.platformDistanceKm) &&
      sample.durationBucket === bucketDuration(job.activeMinutes) &&
      sample.timeBand === timeBand(job.startedAt)
  );

  if (matches.length === 0) {
    return { sampleSize: 0 };
  }

  const payouts = matches.map((sample) => sample.payout).sort((a, b) => a - b);
  const q1 = payouts[Math.floor((payouts.length - 1) * 0.25)];
  const q3 = payouts[Math.floor((payouts.length - 1) * 0.75)];
  const iqr = q3 - q1;
  const filtered = payouts.filter((payout) => payout >= q1 - 1.5 * iqr && payout <= q3 + 1.5 * iqr);
  const midpoint = Math.floor(filtered.length / 2);
  const median = filtered.length % 2 === 0 ? (filtered[midpoint - 1] + filtered[midpoint]) / 2 : filtered[midpoint];

  return {
    median: round(median),
    q1: round(q1),
    q3: round(q3),
    sampleSize: filtered.length,
    recency: matches
      .map((sample) => sample.occurredAt)
      .sort()
      .at(-1)
  };
}

export function evaluateFairness(args: {
  job: Job;
  profile: Pick<UserProfile, "operatingCostPerKm" | "hourlyEarningsFloor">;
  communityJobs?: CommunityJob[];
  extractionConfidence?: number;
  routeVerified?: boolean;
}): FairnessEvaluation {
  const { job, profile, communityJobs = [], extractionConfidence = job.extraction?.overallConfidence ?? 85, routeVerified = true } = args;

  const requiredValues = [
    job.netPayout,
    job.platformDistanceKm,
    job.routeDistanceKm,
    job.activeMinutes,
    profile.operatingCostPerKm
  ];

  if (requiredValues.some((value) => !Number.isFinite(value) || value < 0) || job.activeMinutes === 0) {
    return {
      id: `eval-${job.id}`,
      clerkUserId: job.clerkUserId,
      jobId: job.id,
      benchmarkVersion: bengaluruBenchmark.version,
      assumptions: {},
      formulaExpectedGross: 0,
      estimatedOperatingCost: 0,
      formulaExpectedNet: 0,
      communitySampleSize: 0,
      expectedNet: 0,
      farePaymentScore: 0,
      deductionScore: 0,
      distanceAccuracyScore: 0,
      transparencyScore: 0,
      finalFairnessScore: 0,
      confidenceScore: 0,
      verdict: "Insufficient data",
      estimatedGap: 0,
      explanationFactors: ["Missing required distance, payout, or time information."],
      createdAt: new Date().toISOString()
    };
  }

  const distanceAllowance = job.platformDistanceKm * bengaluruBenchmark.paidDeliveryDistancePerKm;
  const pickupAllowance = job.pickupDistanceKm * bengaluruBenchmark.pickupAllowancePerKm;
  const activeTimeAllowance = job.activeMinutes * bengaluruBenchmark.activeTimeAllowancePerMinute;
  const waitingAllowance = job.waitingMinutes * bengaluruBenchmark.waitingAllowancePerMinute;
  const weatherBonus = job.weatherCondition === "heavy-rain" || job.weatherCondition === "rain" ? bengaluruBenchmark.rainBonus : 0;
  const subtotal =
    bengaluruBenchmark.baseFare +
    distanceAllowance +
    pickupAllowance +
    activeTimeAllowance +
    waitingAllowance +
    weatherBonus +
    job.tolls +
    job.parking;
  const formulaExpectedGross = subtotal + (job.nightJob ? subtotal * bengaluruBenchmark.nightPremiumRate : 0);
  const totalRouteDistanceKm = job.routeDistanceKm + job.pickupDistanceKm;
  const estimatedOperatingCost = totalRouteDistanceKm * (profile.operatingCostPerKm || bengaluruBenchmark.defaultOperatingCostPerKm);
  const formulaExpectedNet = formulaExpectedGross - estimatedOperatingCost;
  const stats = communityStats(job, communityJobs);
  const reliableCommunitySample = typeof stats.median === "number" && stats.sampleSize >= bengaluruBenchmark.reliableCommunitySampleSize;
  const expectedNet = reliableCommunitySample ? 0.7 * formulaExpectedNet + 0.3 * stats.median : formulaExpectedNet;
  const farePaymentScore = expectedNet <= 0 ? 100 : clamp((job.netPayout / expectedNet) * 100);
  const unexplainedDeductionPercent = (job.unexplainedDeductions / Math.max(job.grossPayout, 1)) * 100;
  const deductionScore = clamp(100 - 2 * unexplainedDeductionPercent);
  const distanceErrorPercent = (Math.abs(job.platformDistanceKm - job.routeDistanceKm) / Math.max(job.routeDistanceKm, 0.1)) * 100;
  const distanceAccuracyScore = clamp(100 - distanceErrorPercent);
  const visible = job.extraction?.visibleComponents ?? {
    baseFareVisible: true,
    distanceFareVisible: true,
    waitingFareVisible: false,
    incentiveVisible: true,
    deductionReasonVisible: job.unexplainedDeductions === 0,
    taxVisible: false
  };
  const transparency = transparencyScore(visible);
  const finalFairnessScore =
    0.65 * farePaymentScore + 0.15 * deductionScore + 0.1 * distanceAccuracyScore + 0.1 * transparency;
  const completeness = clamp(
    [
      job.platform,
      job.jobType,
      job.grossPayout,
      job.platformDistanceKm,
      job.routeDistanceKm,
      job.activeMinutes,
      job.originArea,
      job.destinationArea
    ].filter(Boolean).length * 12.5
  );
  const communitySampleConfidence = reliableCommunitySample ? 100 : clamp(stats.sampleSize * 18);
  const routeVerificationConfidence = routeVerified ? 100 : 45;
  const confidenceScore =
    0.4 * extractionConfidence + 0.3 * completeness + 0.2 * communitySampleConfidence + 0.1 * routeVerificationConfidence;
  const estimatedGap = Math.max(0, expectedNet - job.netPayout);

  const factors = [
    estimatedGap > 0 ? `Estimated payment gap is ₹${round(estimatedGap)}.` : "Actual net payout is within the benchmark range.",
    job.unexplainedDeductions > 0 ? `Unexplained deductions reduced the deduction score by ₹${job.unexplainedDeductions}.` : "No unexplained deduction was recorded.",
    distanceAccuracyScore < 90 ? "Platform distance differs from route distance." : "Platform and route distances are broadly aligned.",
    reliableCommunitySample ? `Community median of ₹${stats.median} blended into benchmark.` : "Community sample below threshold, formula benchmark used."
  ];

  return {
    id: `eval-${job.id}`,
    clerkUserId: job.clerkUserId,
    jobId: job.id,
    benchmarkVersion: bengaluruBenchmark.version,
    assumptions: {
      baseFare: bengaluruBenchmark.baseFare,
      paidDeliveryDistancePerKm: bengaluruBenchmark.paidDeliveryDistancePerKm,
      pickupAllowancePerKm: bengaluruBenchmark.pickupAllowancePerKm,
      activeTimeAllowancePerMinute: bengaluruBenchmark.activeTimeAllowancePerMinute,
      waitingAllowancePerMinute: bengaluruBenchmark.waitingAllowancePerMinute,
      operatingCostPerKm: profile.operatingCostPerKm,
      nightPremiumRate: bengaluruBenchmark.nightPremiumRate,
      rainBonus: bengaluruBenchmark.rainBonus
    },
    formulaExpectedGross: round(formulaExpectedGross),
    estimatedOperatingCost: round(estimatedOperatingCost),
    formulaExpectedNet: round(formulaExpectedNet),
    communityMedian: stats.median,
    communitySampleSize: stats.sampleSize,
    expectedNet: round(expectedNet),
    farePaymentScore: round(farePaymentScore),
    deductionScore: round(deductionScore),
    distanceAccuracyScore: round(distanceAccuracyScore),
    transparencyScore: round(transparency),
    finalFairnessScore: round(finalFairnessScore),
    confidenceScore: round(confidenceScore),
    verdict: verdictFor(finalFairnessScore),
    estimatedGap: round(estimatedGap),
    explanationFactors: factors,
    createdAt: new Date().toISOString()
  };
}
