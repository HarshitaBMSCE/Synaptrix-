import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Coordinate } from "@/lib/types";

const origin: Coordinate = [77.6408, 12.9719];
const destination: Coordinate = [77.6245, 12.9352];
const waypoint: Coordinate = [77.6382, 12.9116];

const orsPayload = {
  features: [
    {
      geometry: {
        type: "LineString",
        coordinates: [origin, waypoint, destination]
      },
      properties: {
        summary: {
          distance: 8240,
          duration: 1560
        }
      }
    }
  ]
};

async function freshMapsModule() {
  vi.resetModules();
  return import("@/lib/maps");
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("OpenRouteService routing adapter", () => {
  it("normalizes a successful OpenRouteService response", async () => {
    vi.stubEnv("OPENROUTESERVICE_API_KEY", "ors-test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(orsPayload), { status: 200 })));
    const { getRouteOptions } = await freshMapsModule();

    const routes = await getRouteOptions({
      origin: "Indiranagar",
      destination: "Koramangala",
      originCoordinates: origin,
      destinationCoordinates: destination,
      departureTime: "2026-07-31T10:00:00.000Z",
      fatigueScore: 10
    });

    expect(routes).toHaveLength(1);
    expect(routes[0]).toMatchObject({
      provider: "openrouteservice",
      distanceMeters: 8240,
      distanceKm: 8.2,
      durationSeconds: 1560,
      etaMinutes: 26,
      geometry: { type: "LineString", coordinates: [origin, waypoint, destination] }
    });
  });

  it("sends coordinates as [longitude, latitude] and preserves waypoint order", async () => {
    vi.stubEnv("OPENROUTESERVICE_API_KEY", "ors-test-key");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(orsPayload), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getRouteOptions } = await freshMapsModule();

    await getRouteOptions({
      origin: "start",
      destination: "end",
      originCoordinates: origin,
      destinationCoordinates: destination,
      waypoints: [waypoint],
      departureTime: "2026-07-31T10:00:00.000Z",
      fatigueScore: 0
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { coordinates: Coordinate[] };
    expect(requestBody.coordinates).toEqual([origin, waypoint, destination]);
  });

  it("returns an error when the API key is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { getRouteOptions } = await freshMapsModule();

    await expect(getRouteOptions({
      origin: "Indiranagar",
      destination: "Koramangala",
      originCoordinates: origin,
      destinationCoordinates: destination,
      departureTime: "2026-07-31T10:00:00.000Z",
      fatigueScore: 0
    })).rejects.toThrow("OPENROUTESERVICE_API_KEY");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns an error when OpenRouteService fails", async () => {
    vi.stubEnv("OPENROUTESERVICE_API_KEY", "ors-test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unavailable", { status: 503 })));
    const { getRouteOptions } = await freshMapsModule();

    await expect(getRouteOptions({
      origin: "Indiranagar",
      destination: "Koramangala",
      originCoordinates: origin,
      destinationCoordinates: destination,
      departureTime: "2026-07-31T10:00:00.000Z",
      fatigueScore: 0
    })).rejects.toThrow("temporarily unavailable");
  });

  it("returns an error for malformed OpenRouteService responses", async () => {
    vi.stubEnv("OPENROUTESERVICE_API_KEY", "ors-test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ features: [{ properties: {} }] }), { status: 200 })));
    const { getRouteOptions } = await freshMapsModule();

    await expect(getRouteOptions({
      origin: "Indiranagar",
      destination: "Koramangala",
      originCoordinates: origin,
      destinationCoordinates: destination,
      departureTime: "2026-07-31T10:00:00.000Z",
      fatigueScore: 0
    })).rejects.toThrow("unexpected format");
  });

  it("returns an error for rate-limit responses", async () => {
    vi.stubEnv("OPENROUTESERVICE_API_KEY", "ors-test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("too many requests", { status: 429 })));
    const { getRouteOptions } = await freshMapsModule();

    await expect(getRouteOptions({
      origin: "Indiranagar",
      destination: "Koramangala",
      originCoordinates: origin,
      destinationCoordinates: destination,
      departureTime: "2026-07-31T10:00:00.000Z",
      fatigueScore: 0
    })).rejects.toThrow("rate limit");
  });
});
