import { describe, expect, it } from "vitest";
import { parseVoiceExtractionJson, voiceExtractionSchema } from "@/lib/claude";
import { voiceParseSchema } from "@/lib/validations";

describe("voice entry extraction", () => {
  it("validates multilingual transcript payloads", () => {
    expect(voiceParseSchema.parse({ transcript: "Swiggy delivery paid 112 rupees", language: "hi-IN" }).language).toBe("hi-IN");
    expect(voiceParseSchema.parse({ transcript: "Swiggy delivery paid 112 rupees", language: "kn-IN" }).language).toBe("kn-IN");
  });

  it("rejects empty transcript payloads", () => {
    expect(voiceParseSchema.safeParse({ transcript: "", language: "en-IN" }).success).toBe(false);
  });

  it("validates Claude voice extraction JSON", () => {
    const parsed = parseVoiceExtractionJson(
      JSON.stringify({
        platform: "Swiggy",
        jobType: "delivery",
        grossPayout: 112,
        baseFare: null,
        incentives: null,
        tips: null,
        deductions: 15,
        unexplainedDeductions: 15,
        distanceKm: 7.4,
        durationMinutes: 34,
        waitingMinutes: 8,
        pickupDistanceKm: null,
        originArea: null,
        destinationArea: null,
        overallConfidence: 86,
        warnings: []
      })
    );
    expect(parsed.platform).toBe("Swiggy");
    expect(parsed.grossPayout).toBe(112);
    expect(parsed.distanceKm).toBe(7.4);
    expect(parsed.durationMinutes).toBe(34);
    expect(parsed.deductions).toBe(15);
    expect(parsed.waitingMinutes).toBe(8);
  });

  it("rejects malformed Claude voice extraction", () => {
    expect(() => voiceExtractionSchema.parse({ platform: "Swiggy" })).toThrow();
  });
});
