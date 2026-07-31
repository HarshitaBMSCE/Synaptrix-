import { describe, expect, it } from "vitest";
import { parseVoiceTranscript } from "@/lib/claude";
import { voiceParseSchema } from "@/lib/validations";

describe("voice entry extraction", () => {
  it("validates multilingual transcript payloads", () => {
    expect(voiceParseSchema.parse({ transcript: "Swiggy delivery paid 112 rupees", language: "hi-IN" }).language).toBe("hi-IN");
    expect(voiceParseSchema.parse({ transcript: "Swiggy delivery paid 112 rupees", language: "kn-IN" }).language).toBe("kn-IN");
  });

  it("rejects empty transcript payloads", () => {
    expect(voiceParseSchema.safeParse({ transcript: "", language: "en-IN" }).success).toBe(false);
  });

  it("extracts expected fields from typed fallback text", async () => {
    const parsed = await parseVoiceTranscript(
      "I completed a Swiggy food delivery for 112 rupees. The trip was 7.4 kilometres and took 34 minutes. There was a deduction of 15 rupees and I waited for 8 minutes.",
      "en-IN"
    );
    expect(parsed.platform).toBe("Swiggy");
    expect(parsed.grossPayout).toBe(112);
    expect(parsed.platformDistanceKm).toBe(7.4);
    expect(parsed.activeMinutes).toBe(34);
    expect(parsed.deductions).toBe(15);
    expect(parsed.waitingMinutes).toBe(8);
  });
});
