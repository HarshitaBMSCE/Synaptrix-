import { describe, expect, it } from "vitest";
import { jobInputSchema } from "@/lib/validations";

describe("API validation", () => {
  it("rejects invalid job payloads before persistence", () => {
    const result = jobInputSchema.safeParse({
      platform: "Unknown",
      jobType: "delivery",
      grossPayout: -1,
      platformDistanceKm: 8,
      routeDistanceKm: 8,
      activeMinutes: 30,
      startedAt: "2026-07-31T08:00:00.000Z",
      completedAt: "2026-07-31T08:30:00.000Z",
      originArea: "A",
      destinationArea: "Koramangala"
    });

    expect(result.success).toBe(false);
  });
});
