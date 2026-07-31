import { describe, expect, it } from "vitest";
import { extractionToJobInput, parseExtractionJson, screenshotExtractionSchema, type ScreenshotExtraction } from "@/lib/extraction";
import { validateScreenshotFile } from "@/lib/upload-validation";

function validExtraction(): ScreenshotExtraction {
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
    date: "2026-07-31T10:00:00.000Z",
    originArea: "Indiranagar",
    destinationArea: "Koramangala",
    baseFareVisible: true,
    distanceFareVisible: true,
    waitingFareVisible: false,
    incentiveVisible: false,
    deductionReasonVisible: false,
    taxVisible: false,
    overallConfidence: 82,
    fieldConfidence: { platform: 94, grossPayout: 90 },
    warnings: ["Confirm route distance before saving."]
  };
}

describe("screenshot upload and extraction", () => {
  it("accepts supported screenshot formats", () => {
    expect(validateScreenshotFile({ type: "image/png", size: 1024 }).valid).toBe(true);
    expect(validateScreenshotFile({ type: "image/jpeg", size: 1024 }).valid).toBe(true);
    expect(validateScreenshotFile({ type: "image/webp", size: 1024 }).valid).toBe(true);
  });

  it("rejects unsupported screenshot formats", () => {
    expect(validateScreenshotFile({ type: "application/pdf", size: 1024 }).valid).toBe(false);
  });

  it("rejects oversized screenshots", () => {
    expect(validateScreenshotFile({ type: "image/png", size: 11 * 1024 * 1024 }).valid).toBe(false);
  });

  it("validates Claude extraction JSON and maps it to job input", () => {
    const extraction = screenshotExtractionSchema.parse(validExtraction());
    const jobInput = extractionToJobInput(extraction, ["asset-1"]);
    expect(jobInput.captureMethod).toBe("screenshot");
    expect(jobInput.platform).toBe("Swiggy");
    expect(jobInput.evidenceAssetIds).toEqual(["asset-1"]);
  });

  it("strips markdown fences and parses extraction JSON", () => {
    const extraction = validExtraction();
    expect(parseExtractionJson(`\`\`\`json\n${JSON.stringify(extraction)}\n\`\`\``).platform).toBe("Swiggy");
  });

  it("rejects malformed extraction JSON", () => {
    expect(() => parseExtractionJson("{ bad json")).toThrow();
    expect(() => screenshotExtractionSchema.parse({ platform: "Swiggy" })).toThrow();
  });
});
