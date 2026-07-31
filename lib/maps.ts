import { scoreRoute } from "@/lib/safety";
import type { RouteOption } from "@/lib/types";

export async function getRouteOptions(args: { origin: string; destination: string; departureTime: string; fatigueScore: number }): Promise<RouteOption[]> {
  const seeded = [
    { id: "route-1", name: "Outer Ring Road via Indiranagar", distanceKm: 13.4, etaMinutes: 38, weather: "rain", incidentHotspotLevel: 1, safePlaceDensity: 8, detourPercent: 0 },
    { id: "route-2", name: "Old Airport Road and Domlur", distanceKm: 14.8, etaMinutes: 43, weather: "rain", incidentHotspotLevel: 0, safePlaceDensity: 10, detourPercent: 10 },
    { id: "route-3", name: "Inner lanes through Ejipura", distanceKm: 12.9, etaMinutes: 36, weather: "rain", incidentHotspotLevel: 3, safePlaceDensity: 3, detourPercent: 0 },
    { id: "route-4", name: "100 Feet Road safer pickup corridor", distanceKm: 15.2, etaMinutes: 45, weather: "rain", incidentHotspotLevel: 0, safePlaceDensity: 9, detourPercent: 14 }
  ] as const;

  const options = seeded.map((route) => {
    const scored = scoreRoute({
      distanceKm: route.distanceKm,
      etaMinutes: route.etaMinutes,
      departureTime: args.departureTime,
      weather: route.weather,
      incidentHotspotLevel: route.incidentHotspotLevel,
      safePlaceDensity: route.safePlaceDensity,
      fatigueScore: args.fatigueScore,
      detourPercent: route.detourPercent
    });
    return {
      id: route.id,
      name: route.name,
      distanceKm: route.distanceKm,
      etaMinutes: route.etaMinutes,
      weather: route.weather,
      fastest: false,
      recommended: false,
      ...scored
    };
  });

  const fastest = options.reduce((best, option) => (option.etaMinutes < best.etaMinutes ? option : best), options[0]);
  const recommended = options.reduce((best, option) => (option.safetyScore > best.safetyScore ? option : best), options[0]);

  return options.map((option) => ({
    ...option,
    fastest: option.id === fastest.id,
    recommended: option.id === recommended.id
  }));
}
