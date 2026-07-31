import { listCommunityJobs, listEvaluations, listJobs, listWorkSessions, getSavingsGoal } from "@/lib/repository";
import { communityStats } from "@/lib/fairness";

export async function getDashboardSummary(clerkUserId: string, range: "daily" | "weekly" | "monthly" = "daily") {
  const [jobs, evaluations, sessions, savingsGoal] = await Promise.all([
    listJobs(clerkUserId),
    listEvaluations(clerkUserId),
    listWorkSessions(clerkUserId),
    getSavingsGoal(clerkUserId)
  ]);

  const now = Date.now();
  const rangeMs = range === "daily" ? 24 * 60 * 60 * 1000 : range === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 31 * 24 * 60 * 60 * 1000;
  const filteredJobs = jobs.filter((job) => now - Date.parse(job.startedAt) <= rangeMs);
  const filteredIds = new Set(filteredJobs.map((job) => job.id));
  const filteredEvaluations = evaluations.filter((evaluation) => filteredIds.has(evaluation.jobId));
  const gross = filteredJobs.reduce((sum, job) => sum + job.grossPayout, 0);
  const deductions = filteredJobs.reduce((sum, job) => sum + job.deductions, 0);
  const net = filteredJobs.reduce((sum, job) => sum + job.netPayout, 0);
  const activeMinutes = filteredJobs.reduce((sum, job) => sum + job.activeMinutes, 0);
  const waitingMinutes = filteredJobs.reduce((sum, job) => sum + job.waitingMinutes, 0);
  const distanceKm = filteredJobs.reduce((sum, job) => sum + job.routeDistanceKm + job.pickupDistanceKm, 0);
  const underpaymentGap = filteredEvaluations.reduce((sum, evaluation) => sum + evaluation.estimatedGap, 0);
  const flaggedJobs = filteredEvaluations.filter((evaluation) => evaluation.finalFairnessScore < 70).length;
  const estimatedOperatingCost = filteredEvaluations.reduce((sum, evaluation) => sum + evaluation.estimatedOperatingCost, 0);
  const trueIncome = net - estimatedOperatingCost;
  const fairnessAverage =
    filteredEvaluations.length > 0
      ? Math.round(filteredEvaluations.reduce((sum, evaluation) => sum + evaluation.finalFairnessScore, 0) / filteredEvaluations.length)
      : 0;
  const fatigueScore = sessions[0]?.fatigueScore ?? 0;

  const platformComparison = Object.entries(
    filteredJobs.reduce<Record<string, typeof filteredJobs>>((groups, job) => {
      groups[job.platform] = [...(groups[job.platform] ?? []), job];
      return groups;
    }, {})
  ).map(([platform, group]) => {
    const groupIds = new Set(group.map((job) => job.id));
    const groupEvaluations = filteredEvaluations.filter((evaluation) => groupIds.has(evaluation.jobId));
    const groupNet = group.reduce((sum, job) => sum + job.netPayout, 0);
    const groupActiveHours = Math.max(group.reduce((sum, job) => sum + job.activeMinutes, 0) / 60, 0.1);
    const groupDistance = Math.max(group.reduce((sum, job) => sum + job.routeDistanceKm + job.pickupDistanceKm, 0), 0.1);
    const groupGross = Math.max(group.reduce((sum, job) => sum + job.grossPayout, 0), 1);
    return {
      platform,
      netEarnings: Math.round(groupNet),
      netPerHour: Math.round(groupNet / groupActiveHours),
      payPerKm: Math.round(groupNet / groupDistance),
      deductionRate: Math.round((group.reduce((sum, job) => sum + job.deductions, 0) / groupGross) * 100),
      fairnessAverage:
        groupEvaluations.length > 0
          ? Math.round(groupEvaluations.reduce((sum, evaluation) => sum + evaluation.finalFairnessScore, 0) / groupEvaluations.length)
          : 0,
      flaggedJobCount: groupEvaluations.filter((evaluation) => evaluation.finalFairnessScore < 70).length
    };
  });

  const trend = filteredJobs
    .slice()
    .reverse()
    .map((job) => ({
      date: new Date(job.startedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      net: job.netPayout,
      underpayment: filteredEvaluations.find((evaluation) => evaluation.jobId === job.id)?.estimatedGap ?? 0,
      active: Math.round(job.activeMinutes / 6) / 10,
      waiting: Math.round(job.waitingMinutes / 6) / 10
    }));

  const community = filteredJobs.slice(0, 3).map((job) => ({ jobId: job.id, platform: job.platform, ...communityStats(job, listCommunityJobs()) }));

  return {
    range,
    gross,
    deductions,
    net,
    activeMinutes,
    waitingMinutes,
    distanceKm: Math.round(distanceKm * 10) / 10,
    estimatedOperatingCost: Math.round(estimatedOperatingCost),
    trueIncome: Math.round(trueIncome),
    payPerActiveHour: activeMinutes > 0 ? Math.round(net / (activeMinutes / 60)) : 0,
    payPerKm: distanceKm > 0 ? Math.round(net / distanceKm) : 0,
    underpaymentGap: Math.round(underpaymentGap),
    flaggedJobs,
    fairnessAverage,
    fatigueScore,
    savingsGoal,
    platformComparison,
    trend,
    jobs: filteredJobs,
    evaluations: filteredEvaluations,
    community
  };
}
