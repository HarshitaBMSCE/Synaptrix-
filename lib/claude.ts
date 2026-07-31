import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages";
import { z } from "zod";
import { getRightsSnippet } from "@/lib/rights-pack";
import type { Complaint, Job } from "@/lib/types";

const platformSchema = z.enum(["Swiggy", "Zomato", "Blinkit", "Uber", "Ola", "Rapido"]);
const jobTypeSchema = z.enum(["delivery", "ride", "courier", "service"]);

export const voiceExtractionSchema = z.object({
  platform: platformSchema.nullable(),
  jobType: jobTypeSchema.nullable(),
  grossPayout: z.number().nonnegative().nullable(),
  baseFare: z.number().nonnegative().nullable(),
  incentives: z.number().nonnegative().nullable(),
  tips: z.number().nonnegative().nullable(),
  deductions: z.number().nonnegative().nullable(),
  unexplainedDeductions: z.number().nonnegative().nullable(),
  distanceKm: z.number().nonnegative().nullable(),
  durationMinutes: z.number().nonnegative().nullable(),
  waitingMinutes: z.number().nonnegative().nullable(),
  pickupDistanceKm: z.number().nonnegative().nullable(),
  originArea: z.string().nullable(),
  destinationArea: z.string().nullable(),
  overallConfidence: z.number().min(0).max(100),
  warnings: z.array(z.string())
});

const complaintDraftSchema = z.object({
  subject: z.string().min(3),
  body: z.string().min(20),
  requestedRemedy: z.string().min(3)
});

const weeklyNarrativeSchema = z.object({
  insight: z.string().min(1),
  risk: z.string().min(1),
  action: z.string().min(1),
  narrative: z.string().min(1)
});

function requireAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required for Claude-powered features.");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function anthropicModel() {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

function stripJsonFences(text: string) {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

function responseText(response: Message) {
  const text = response.content.map((part) => (part.type === "text" ? part.text : "")).join("\n").trim();
  if (!text) throw new Error("Claude returned an empty response.");
  return text;
}

export function parseVoiceExtractionJson(text: string) {
  return voiceExtractionSchema.parse(JSON.parse(stripJsonFences(text)) as unknown);
}

export async function parseVoiceTranscript(transcript: string, language = "en-IN") {
  const response = await requireAnthropic().messages.create({
    model: anthropicModel(),
    max_tokens: 700,
    system:
      "Extract structured gig job facts from a worker transcript. Return strict JSON only. Use null for unavailable facts. Use jobType values delivery, ride, courier, or service. Do not calculate fairness scores.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          language,
          transcript,
          requiredKeys: [
            "platform",
            "jobType",
            "grossPayout",
            "baseFare",
            "incentives",
            "tips",
            "deductions",
            "unexplainedDeductions",
            "distanceKm",
            "durationMinutes",
            "waitingMinutes",
            "pickupDistanceKm",
            "originArea",
            "destinationArea",
            "overallConfidence",
            "warnings"
          ]
        })
      }
    ]
  });

  const parsed = parseVoiceExtractionJson(responseText(response));
  return {
    platform: parsed.platform ?? "Swiggy",
    jobType: parsed.jobType ?? "delivery",
    grossPayout: parsed.grossPayout ?? 0,
    baseFare: parsed.baseFare ?? 0,
    incentives: parsed.incentives ?? 0,
    tips: parsed.tips ?? 0,
    deductions: parsed.deductions ?? 0,
    unexplainedDeductions: parsed.unexplainedDeductions ?? parsed.deductions ?? 0,
    platformDistanceKm: parsed.distanceKm ?? 0,
    routeDistanceKm: parsed.distanceKm ?? 0,
    pickupDistanceKm: parsed.pickupDistanceKm ?? 0,
    activeMinutes: parsed.durationMinutes ?? 0,
    waitingMinutes: parsed.waitingMinutes ?? 0,
    originArea: parsed.originArea ?? "",
    destinationArea: parsed.destinationArea ?? "",
    extractionConfidence: parsed.overallConfidence,
    warnings: parsed.warnings
  };
}

export async function explainAssistantAnswer(args: { message: string; job?: Job | null; language?: string }) {
  const rights = getRightsSnippet(args.message.includes("deduct") ? "Clear deductions" : "Payment transparency");
  const response = await requireAnthropic().messages.create({
    model: anthropicModel(),
    max_tokens: 450,
    system:
      "You are GigShield's worker-rights assistant. Use only supplied facts. Distinguish product guidance from legal information. Never invent platform policy.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({ question: args.message, job: args.job, rights, language: args.language ?? "en-IN" })
      }
    ]
  });
  return responseText(response);
}

export async function draftComplaint(args: { jobs: Job[]; type: Complaint["type"]; tone: Complaint["tone"] }) {
  const response = await requireAnthropic().messages.create({
    model: anthropicModel(),
    max_tokens: 900,
    system:
      "Draft an evidence-backed gig-platform complaint. Return strict JSON only with subject, body, and requestedRemedy. Use supplied job facts only and leave unknown facts as placeholders.",
    messages: [{ role: "user", content: JSON.stringify(args) }]
  });
  return complaintDraftSchema.parse(JSON.parse(stripJsonFences(responseText(response))) as unknown);
}

export async function weeklyNarrative(metrics: unknown) {
  const response = await requireAnthropic().messages.create({
    model: anthropicModel(),
    max_tokens: 500,
    system: "Write concise weekly GigShield insights. Return strict JSON only with insight, risk, action, and narrative. Preserve every numeric value from the provided metrics.",
    messages: [{ role: "user", content: JSON.stringify(metrics) }]
  });
  return weeklyNarrativeSchema.parse(JSON.parse(stripJsonFences(responseText(response))) as unknown);
}
