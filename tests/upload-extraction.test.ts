import { describe, expect, it } from "vitest";
import { demoScreenshotExtraction, extractionToJobInput, parseExtractionJson, screenshotExtractionSchema } from "@/lib/extraction";
import { validateScreenshotFile } from "@/lib/upload-validation";

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

  it("validates demo extraction and maps it to job input", () => {
    const extraction = screenshotExtractionSchema.parse(demoScreenshotExtraction());
    const jobInput = extractionToJobInput(extraction, ["asset-1"]);
    expect(jobInput.captureMethod).toBe("screenshot");
    expect(jobInput.platform).toBe("Swiggy");
    expect(jobInput.evidenceAssetIds).toEqual(["asset-1"]);
  });

  it("strips markdown fences and parses extraction JSON", () => {
    const extraction = demoScreenshotExtraction();
    expect(parseExtractionJson(`\`\`\`json\n${JSON.stringify(extraction)}\n\`\`\``).platform).toBe("Swiggy");
  });

  it("rejects malformed extraction JSON", () => {
    expect(() => parseExtractionJson("{ bad json")).toThrow();
    expect(() => screenshotExtractionSchema.parse({ platform: "Swiggy" })).toThrow();
  });
});
