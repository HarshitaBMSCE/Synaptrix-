import { DEMO_USER_ID, demoCommunityJobs, demoComplaints, demoEvaluations, demoEvidence, demoJobs, demoNotifications, demoProfile, demoSavingsGoal, demoSessions } from "@/lib/demo-data";
import { evaluateFairness } from "@/lib/fairness";
import type { Complaint, EvidenceAsset, Job, Notification, SavingsGoal, UserProfile, WorkSession } from "@/lib/types";

const memoryJobs = new Map<string, Job>(demoJobs.map((job) => [job.id, job]));
const memoryComplaints = new Map<string, Complaint>(demoComplaints.map((complaint) => [complaint.id, complaint]));
const memoryEvidence = new Map<string, EvidenceAsset>(demoEvidence.map((asset) => [asset.id, asset]));

export async function getProfile(clerkUserId = DEMO_USER_ID): Promise<UserProfile> {
  return { ...demoProfile, clerkUserId };
}

export async function listJobs(clerkUserId = DEMO_USER_ID): Promise<Job[]> {
  return [...memoryJobs.values()]
    .filter((job) => job.clerkUserId === DEMO_USER_ID || job.clerkUserId === clerkUserId)
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
}

export async function getJob(clerkUserId: string, jobId: string): Promise<Job | null> {
  const job = memoryJobs.get(jobId);
  if (!job) return null;
  return job.clerkUserId === DEMO_USER_ID || job.clerkUserId === clerkUserId ? job : null;
}

export async function saveJob(clerkUserId: string, input: Omit<Job, "id" | "clerkUserId" | "netPayout" | "reviewStatus"> & { reviewStatus?: Job["reviewStatus"] }) {
  const id = `job-${Date.now()}`;
  const job: Job = {
    ...input,
    id,
    clerkUserId,
    netPayout: input.grossPayout + input.tips + input.incentives - input.deductions,
    reviewStatus: input.reviewStatus ?? "confirmed"
  };
  memoryJobs.set(id, job);
  return job;
}

export async function deleteJob(clerkUserId: string, jobId: string) {
  const job = await getJob(clerkUserId, jobId);
  if (!job || job.clerkUserId !== clerkUserId) return false;
  memoryJobs.delete(jobId);
  return true;
}

export async function evaluateJob(clerkUserId: string, jobId: string) {
  const profile = await getProfile(clerkUserId);
  const job = await getJob(clerkUserId, jobId);
  if (!job) return null;
  return evaluateFairness({ job, profile, communityJobs: demoCommunityJobs });
}

export async function listEvaluations(clerkUserId = DEMO_USER_ID) {
  const jobs = await listJobs(clerkUserId);
  return jobs.map((job) => evaluateFairness({ job, profile: demoProfile, communityJobs: demoCommunityJobs }));
}

export async function getEvaluation(clerkUserId: string, jobId: string) {
  return (await listEvaluations(clerkUserId)).find((evaluation) => evaluation.jobId === jobId) ?? null;
}

export async function listEvidence(clerkUserId = DEMO_USER_ID): Promise<EvidenceAsset[]> {
  return [...memoryEvidence.values()].filter((asset) => asset.clerkUserId === DEMO_USER_ID || asset.clerkUserId === clerkUserId);
}

export async function saveEvidence(asset: EvidenceAsset) {
  memoryEvidence.set(asset.id, asset);
  return asset;
}

export async function listComplaints(clerkUserId = DEMO_USER_ID): Promise<Complaint[]> {
  return [...memoryComplaints.values()].filter((complaint) => complaint.clerkUserId === DEMO_USER_ID || complaint.clerkUserId === clerkUserId);
}

export async function getComplaint(clerkUserId: string, complaintId: string) {
  const complaint = memoryComplaints.get(complaintId);
  if (!complaint) return null;
  return complaint.clerkUserId === DEMO_USER_ID || complaint.clerkUserId === clerkUserId ? complaint : null;
}

export async function saveComplaint(complaint: Complaint) {
  memoryComplaints.set(complaint.id, complaint);
  return complaint;
}

export async function listWorkSessions(clerkUserId = DEMO_USER_ID): Promise<WorkSession[]> {
  return demoSessions.filter((session) => session.clerkUserId === DEMO_USER_ID || session.clerkUserId === clerkUserId);
}

export async function getSavingsGoal(clerkUserId = DEMO_USER_ID): Promise<SavingsGoal> {
  return { ...demoSavingsGoal, clerkUserId };
}

export async function listNotifications(clerkUserId = DEMO_USER_ID): Promise<Notification[]> {
  return demoNotifications.filter((notification) => notification.clerkUserId === DEMO_USER_ID || notification.clerkUserId === clerkUserId);
}

export function listCommunityJobs() {
  return demoCommunityJobs;
}

export function addCommunityJob(sample: (typeof demoCommunityJobs)[number]) {
  demoCommunityJobs.push(sample);
  return sample;
}

export function staticEvaluations() {
  return demoEvaluations;
}
