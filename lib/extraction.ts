import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { JobInput } from "@/lib/validations";

export const screenshotExtractionSchema = z.object({
  platform: z.enum(["Swiggy", "Zomato", "Blinkit", "Uber", "Ola", "Rapido"]).nullable(),
  jobType: z.enum(["delivery", "ride", "courier", "service"]).nullable(),
  grossPayout: z.number().nonnegative().nullable(),
  baseFare: z.number().nonnegative().nullable(),
  incentives: z.number().nonnegative().nullable(),
  tips: z.number().nonnegative().nullable(),
  deductions: z.number().nonnegative().nullable(),
  unexplainedDeductions: z.number().nonnegative().nullable(),
  deductionReason: z.string().nullable(),
  distanceKm: z.number().nonnegative().nullable(),
  durationMinutes: z.number().nonnegative().nullable(),
  waitingMinutes: z.number().nonnegative().nullable(),
  pickupDistanceKm: z.number().nonnegative().nullable(),
  date: z.string().nullable(),
  originArea: z.string().nullable(),
  destinationArea: z.string().nullable(),
  baseFareVisible: z.boolean(),
  distanceFareVisible: z.boolean(),
  waitingFareVisible: z.boolean(),
  incentiveVisible: z.boolean(),
  deductionReasonVisible: z.boolean(),
  taxVisible: z.boolean(),
  overallConfidence: z.number().min(0).max(100),
  fieldConfidence: z.record(z.number().min(0).max(100)),
  warnings: z.array(z.string())
});

export type ScreenshotExtraction = z.infer<typeof screenshotExtractionSchema>;

const nullableExtractionKeys = [
  "platform",
  "jobType",
  "grossPayout",
  "baseFare",
  "incentives",
  "tips",
  "deductions",
  "unexplainedDeductions",
  "deductionReason",
  "distanceKm",
  "durationMinutes",
  "waitingMinutes",
  "pickupDistanceKm",
  "date",
  "originArea",
  "destinationArea"
] as const;

const visibleExtractionKeys = [
  "baseFareVisible",
  "distanceFareVisible",
  "waitingFareVisible",
  "incentiveVisible",
  "deductionReasonVisible",
  "taxVisible"
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractionCandidate(value: unknown) {
  if (!isRecord(value)) return value;
  if (isRecord(value.extraction)) return value.extraction;
  if (isRecord(value.job)) return value.job;
  if (isRecord(value.data)) return value.data;
  return value;
}

function normalizeExtractionPayload(value: unknown) {
  const candidate = extractionCandidate(value);
  if (!isRecord(candidate)) return candidate;

  const normalized: Record<string, unknown> = { ...candidate };
  const missingKeys: string[] = [];

  for (const key of nullableExtractionKeys) {
    if (!(key in normalized)) {
      normalized[key] = null;
      missingKeys.push(key);
    }
  }

  for (const key of visibleExtractionKeys) {
    if (!(key in normalized)) {
      normalized[key] = false;
      missingKeys.push(key);
    }
  }

  if (!("overallConfidence" in normalized)) {
    normalized.overallConfidence = 0;
    missingKeys.push("overallConfidence");
  }
  if (!isRecord(normalized.fieldConfidence)) {
    normalized.fieldConfidence = {};
    if (!missingKeys.includes("fieldConfidence")) missingKeys.push("fieldConfidence");
  }
  if (!Array.isArray(normalized.warnings)) {
    normalized.warnings = [];
    if (!missingKeys.includes("warnings")) missingKeys.push("warnings");
  }

  if (missingKeys.length > 0) {
    normalized.warnings = [
      ...(normalized.warnings as string[]),
      `Claude did not return these extraction fields: ${missingKeys.join(", ")}. Review and fill them before saving.`
    ];
  }

  return normalized;
}

export function hasUsableScreenshotExtraction(extraction: ScreenshotExtraction) {
  return typeof extraction.grossPayout === "number" && extraction.grossPayout > 0;
}

export function extractionWarnings(extraction: ScreenshotExtraction) {
  const warnings = [...extraction.warnings];
  if (!hasUsableScreenshotExtraction(extraction)) {
    warnings.push(
      "No worker payout amount was found. Upload a gig worker earnings/payout screenshot, not a customer order receipt, before saving a job."
    );
  }
  return Array.from(new Set(warnings));
}

export function stripJsonFences(text: string) {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

export function parseExtractionJson(text: string): ScreenshotExtraction {
  const parsed = JSON.parse(stripJsonFences(text)) as unknown;
  return screenshotExtractionSchema.parse(normalizeExtractionPayload(parsed));
}

function requireAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required for Claude screenshot extraction.");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function anthropicModel() {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

async function askClaudeForExtraction(image: { base64: string; mimeType: string }, correctionPrompt?: string) {
  const response = await requireAnthropic().messages.create({
    model: anthropicModel(),
    max_tokens: 900,
	    system:
	      "Extract only structured gig worker earning and payout data. Return strict JSON only. Use null for unavailable fields. Do not calculate fairness scores. Do not use customer order totals, item totals, taxes, delivery charges paid by the customer, or restaurant invoice amounts as worker payout.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              correctionPrompt ??
	              "Extract a gig worker payout or earnings job from this screenshot. Return one JSON object with these exact keys: platform, jobType, grossPayout, baseFare, incentives, tips, deductions, unexplainedDeductions, deductionReason, distanceKm, durationMinutes, waitingMinutes, pickupDistanceKm, date, originArea, destinationArea, baseFareVisible, distanceFareVisible, waitingFareVisible, incentiveVisible, deductionReasonVisible, taxVisible, overallConfidence, fieldConfidence, warnings. Use null for unavailable values, false for unavailable visibility booleans, {} for fieldConfidence when unsure, and [] for warnings when none. If the screenshot is a customer receipt or restaurant invoice instead of worker earnings, keep payout and route fields null and add a warning."
          },
          { type: "image", source: { type: "base64", media_type: image.mimeType as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data: image.base64 } }
        ]
      }
    ]
  });
  const text = response.content.map((part) => (part.type === "text" ? part.text : "")).join("\n").trim();
  if (!text) throw new Error("Claude returned an empty screenshot extraction response.");
  return text;
}

export async function extractScreenshotJob(image: { buffer: Buffer; mimeType: string }) {
  if (!image.buffer.byteLength) {
    throw new Error("A screenshot image is required for Claude extraction.");
  }

  const base64 = image.buffer.toString("base64");
  try {
    const first = await askClaudeForExtraction({ base64, mimeType: image.mimeType });
    return { extraction: parseExtractionJson(first), provider: "claude" as const };
  } catch (firstError) {
    const corrected = await askClaudeForExtraction(
	      { base64, mimeType: image.mimeType },
	      `Your previous response failed validation: ${firstError instanceof Error ? firstError.message : "invalid JSON"}. Return corrected strict JSON only with every required key present. Use null for unavailable values, false for unavailable visibility booleans, {} for fieldConfidence when unsure, and [] for warnings when none. Do not use customer order totals, item totals, taxes, delivery charges, or invoice totals as worker payout.`
	    );
    try {
      return { extraction: parseExtractionJson(corrected), provider: "claude" as const };
    } catch (secondError) {
      throw new Error(`Claude screenshot extraction failed validation: ${secondError instanceof Error ? secondError.message : "invalid JSON"}`);
    }
  }
}

export function extractionToJobInput(extraction: ScreenshotExtraction, evidenceAssetIds: string[] = []): Partial<JobInput> {
  const now = new Date().toISOString();
  return {
    platform: extraction.platform ?? "Swiggy",
    jobType: extraction.jobType ?? "delivery",
    captureMethod: "screenshot",
    grossPayout: extraction.grossPayout ?? 0,
    baseFare: extraction.baseFare ?? 0,
    incentives: extraction.incentives ?? 0,
    tips: extraction.tips ?? 0,
    deductions: extraction.deductions ?? 0,
    unexplainedDeductions: extraction.unexplainedDeductions ?? extraction.deductions ?? 0,
    platformDistanceKm: extraction.distanceKm ?? 0,
    routeDistanceKm: extraction.distanceKm ?? 0,
    pickupDistanceKm: extraction.pickupDistanceKm ?? 0,
    activeMinutes: extraction.durationMinutes ?? 0,
    waitingMinutes: extraction.waitingMinutes ?? 0,
    startedAt: extraction.date ?? now,
    completedAt: extraction.date ?? now,
    originArea: extraction.originArea ?? "",
    destinationArea: extraction.destinationArea ?? "",
    tolls: 0,
    parking: 0,
    weatherCondition: "clear",
    nightJob: false,
    notes: extraction.deductionReason ?? "",
    evidenceAssetIds,
    visibleComponents: {
      baseFareVisible: extraction.baseFareVisible,
      distanceFareVisible: extraction.distanceFareVisible,
      waitingFareVisible: extraction.waitingFareVisible,
      incentiveVisible: extraction.incentiveVisible,
      deductionReasonVisible: extraction.deductionReasonVisible,
      taxVisible: extraction.taxVisible
    },
    extractionConfidence: extraction.overallConfidence
  };
}
