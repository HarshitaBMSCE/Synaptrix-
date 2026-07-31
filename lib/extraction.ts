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

export function demoScreenshotExtraction(): ScreenshotExtraction {
  return {
    platform: "Swiggy",
    jobType: "delivery",
    grossPayout: 112,
    baseFare: 25,
    incentives: 0,
    tips: 0,
    deductions: 15,
    unexplainedDeductions: 15,
    deductionReason: null,
    distanceKm: 7.4,
    durationMinutes: 34,
    waitingMinutes: 8,
    pickupDistanceKm: 1.2,
    date: new Date().toISOString(),
    originArea: "Indiranagar",
    destinationArea: "Koramangala",
    baseFareVisible: true,
    distanceFareVisible: true,
    waitingFareVisible: false,
    incentiveVisible: false,
    deductionReasonVisible: false,
    taxVisible: false,
    overallConfidence: 82,
    fieldConfidence: {
      platform: 94,
      grossPayout: 90,
      deductions: 72,
      distanceKm: 85,
      durationMinutes: 80
    },
    warnings: ["Demo extraction: deduction reason was not visible.", "Please confirm route distance before saving."]
  };
}

export function stripJsonFences(text: string) {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

export function parseExtractionJson(text: string): ScreenshotExtraction {
  const parsed = JSON.parse(stripJsonFences(text)) as unknown;
  return screenshotExtractionSchema.parse(parsed);
}

function anthropic() {
  return process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
}

async function askClaudeForExtraction(image: { base64: string; mimeType: string }, correctionPrompt?: string) {
  const client = anthropic();
  if (!client) return demoScreenshotExtraction();
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
    max_tokens: 900,
    system:
      "Extract only structured gig job payment data. Return strict JSON only. Use null for unavailable fields. Do not calculate fairness scores.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              correctionPrompt ??
              "Extract a gig-platform payment job from this screenshot. Required JSON keys: platform, jobType, grossPayout, baseFare, incentives, tips, deductions, unexplainedDeductions, deductionReason, distanceKm, durationMinutes, waitingMinutes, pickupDistanceKm, date, originArea, destinationArea, baseFareVisible, distanceFareVisible, waitingFareVisible, incentiveVisible, deductionReasonVisible, taxVisible, overallConfidence, fieldConfidence, warnings."
          },
          { type: "image", source: { type: "base64", media_type: image.mimeType as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data: image.base64 } }
        ]
      }
    ]
  });
  return response.content.map((part) => (part.type === "text" ? part.text : "")).join("\n");
}

export async function extractScreenshotJob(image?: { buffer: Buffer; mimeType: string }, forceDemo = false) {
  if (forceDemo || !image || !process.env.ANTHROPIC_API_KEY) {
    return { extraction: demoScreenshotExtraction(), provider: "demo" as const };
  }

  const base64 = image.buffer.toString("base64");
  try {
    const first = await askClaudeForExtraction({ base64, mimeType: image.mimeType });
    return { extraction: parseExtractionJson(typeof first === "string" ? first : JSON.stringify(first)), provider: "claude" as const };
  } catch (firstError) {
    try {
      const corrected = await askClaudeForExtraction(
        { base64, mimeType: image.mimeType },
        `Your previous response failed validation: ${firstError instanceof Error ? firstError.message : "invalid JSON"}. Return corrected strict JSON only.`
      );
      return { extraction: parseExtractionJson(typeof corrected === "string" ? corrected : JSON.stringify(corrected)), provider: "claude" as const };
    } catch {
      return { extraction: demoScreenshotExtraction(), provider: "demo" as const };
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
