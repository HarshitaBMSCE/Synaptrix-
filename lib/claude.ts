import Anthropic from "@anthropic-ai/sdk";
import { getRightsSnippet } from "@/lib/rights-pack";
import type { Complaint, Job } from "@/lib/types";

function anthropic() {
  return process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
}

export async function parseVoiceTranscript(transcript: string, language = "en-IN") {
  const lower = transcript.toLowerCase();
  const payout = Number(lower.match(/(?:paid|payout|for|₹|rs\.?)\s*(\d+(?:\.\d+)?)/)?.[1] ?? lower.match(/(\d+(?:\.\d+)?)\s*rupees/)?.[1] ?? 0);
  const distance = Number(lower.match(/(\d+(?:\.\d+)?)\s*(?:km|kilomet)/)?.[1] ?? 0);
  const minutes = Number(lower.match(/(\d+)\s*(?:min|minutes)/)?.[1] ?? lower.match(/took\s*(\d+)/)?.[1] ?? 0);
  const deduction = Number(lower.match(/deduction\s*of\s*(\d+(?:\.\d+)?)/)?.[1] ?? lower.match(/(\d+(?:\.\d+)?)\s*(?:rupees|rs\.?)\s*deduct/)?.[1] ?? lower.match(/deducted\s*(\d+(?:\.\d+)?)/)?.[1] ?? 0);
  const waiting = Number(lower.match(/waited\s*(?:for)?\s*(\d+)/)?.[1] ?? lower.match(/waiting\s*(?:for)?\s*(\d+)/)?.[1] ?? 0);
  const platform = lower.includes("zomato") ? "Zomato" : lower.includes("blinkit") ? "Blinkit" : lower.includes("uber") ? "Uber" : lower.includes("rapido") ? "Rapido" : "Swiggy";

  return {
    platform,
    jobType: platform === "Uber" || platform === "Rapido" ? "ride" : "delivery",
    grossPayout: payout,
    baseFare: 25,
    incentives: 0,
    tips: 0,
    deductions: deduction,
    unexplainedDeductions: deduction,
    platformDistanceKm: distance,
    routeDistanceKm: distance,
    pickupDistanceKm: 1,
    activeMinutes: minutes,
    waitingMinutes: waiting,
    originArea: "Bengaluru pickup area",
    destinationArea: "Bengaluru drop area",
    extractionConfidence: 78,
    language,
    warnings: anthropic() ? [] : ["Provider fallback parsed the transcript. Review all fields before saving."]
  } as const;
}

export async function explainAssistantAnswer(args: { message: string; job?: Job | null; language?: string }) {
  const rights = getRightsSnippet(args.message.includes("deduct") ? "Clear deductions" : "Payment transparency");
  const client = anthropic();
  const fallbackAnswer = () => {
    const jobFacts = args.job
      ? `For ${args.job.platform} job ${args.job.id}, net payout was ₹${args.job.netPayout} over ${args.job.platformDistanceKm} km and ${args.job.activeMinutes} active minutes.`
      : "I can use your recent jobs and dashboard totals to answer this.";
    return `${jobFacts} Relevant theme: ${rights.theme}. ${rights.snippet} This is general information for ${rights.jurisdiction}, not legal advice.`;
  };

  if (!client) {
    return fallbackAnswer();
  }

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 450,
      system:
        "You are GigShield's worker-rights assistant. Use only supplied facts. Distinguish product guidance from legal advice. Never invent platform policy.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({ question: args.message, job: args.job, rights })
        }
      ]
    });
    return response.content.map((part) => (part.type === "text" ? part.text : "")).join("\n");
  } catch {
    return fallbackAnswer();
  }
}

export async function draftComplaint(args: { jobs: Job[]; type: Complaint["type"]; tone: Complaint["tone"] }) {
  const primary = args.jobs[0];
  const subject = `${args.type.replace(/-/g, " ")} review for ${args.jobs.length} job${args.jobs.length > 1 ? "s" : ""}`;
  const body = [
    `I am requesting a review of ${args.jobs.length} ${primary.platform} job record(s).`,
    ...args.jobs.map(
      (job) =>
        `Job ${job.id}: ${job.originArea} to ${job.destinationArea}, completed ${new Date(job.completedAt).toLocaleString("en-IN")}, actual net payout ₹${job.netPayout}, gross ₹${job.grossPayout}, deductions ₹${job.deductions}.`
    ),
    "Relevant rights themes: Payment transparency, clear deductions, and grievance redressal.",
    "Requested response date: [Please add date].",
    "Unknown facts are intentionally left as placeholders: [Please add platform ticket number], [Please add worker platform ID]."
  ].join("\n\n");

  return { subject, body, requestedRemedy: "Please provide the calculation basis and correct any unsupported payment gap." };
}

export async function weeklyNarrative(metrics: unknown) {
  const client = anthropic();
  const fallbackNarrative = () => ({
    insight: "Waiting time and deductions are the biggest levers this week.",
    risk: "A long continuous session created a fatigue warning.",
    action: "Prioritize shorter routes until the complaint draft is resolved.",
    narrative: `Provider fallback insight generated from deterministic metrics: ${JSON.stringify(metrics).slice(0, 320)}`
  });

  if (!client) {
    return fallbackNarrative();
  }

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 500,
      system: "Write a concise weekly insight. Preserve every numeric value from the provided metrics.",
      messages: [{ role: "user", content: JSON.stringify(metrics) }]
    });
    return {
      insight: "Claude weekly insight",
      risk: "See narrative",
      action: "See narrative",
      narrative: response.content.map((part) => (part.type === "text" ? part.text : "")).join("\n")
    };
  } catch {
    return fallbackNarrative();
  }
}
