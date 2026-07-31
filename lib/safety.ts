import type { RouteOption, WorkSession } from "@/lib/types";

export function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function fatigueStatus(score: number) {
  if (score >= 80) return "Stop and rest";
  if (score >= 60) return "High fatigue";
  if (score >= 30) return "Take a short break";
  return "Normal";
}

export function scoreFatigue(session: Pick<WorkSession, "activeMinutes" | "breakMinutes" | "distanceKm" | "jobsCompleted" | "startedAt">) {
  const hours = session.activeMinutes / 60;
  const startedHour = new Date(session.startedAt).getHours();
  const nightWork = startedHour >= 23 || startedHour < 5;
  let score = 0;
  if (hours > 6) score += 20;
  if (hours > 8) score += 20;
  if (session.jobsCompleted > 5) score += 15;
  if (session.activeMinutes - session.breakMinutes > 180) score += 20;
  if (nightWork) score += 15;
  if (session.distanceKm > 60) score += 10;
  return clampScore(score);
}

export function classifyRoute(score: number): RouteOption["classification"] {
  if (score >= 80) return "Lower risk";
  if (score >= 60) return "Moderate risk";
  if (score >= 40) return "High risk";
  return "Very high risk";
}

export function scoreRoute(args: {
  distanceKm: number;
  etaMinutes: number;
  departureTime: string;
  weather: "clear" | "rain" | "heavy-rain";
  incidentHotspotLevel: number;
  safePlaceDensity: number;
  fatigueScore: number;
  detourPercent: number;
}) {
  const hour = new Date(args.departureTime).getHours();
  const night = hour >= 23 || hour < 5;
  const factors: string[] = [];
  let score = 100;

  if (night) {
    score -= 15;
    factors.push("Late-night travel");
  }
  if (args.weather === "heavy-rain" || args.weather === "rain") {
    score -= args.weather === "heavy-rain" ? 10 : 6;
    factors.push(args.weather === "heavy-rain" ? "Heavy rain" : "Rain");
  }
  if (args.incidentHotspotLevel > 0) {
    const penalty = Math.min(25, args.incidentHotspotLevel * 8);
    score -= penalty;
    factors.push("Nearby incident reports");
  }
  if (args.safePlaceDensity < 4) {
    score -= 15;
    factors.push("Low open-place density");
  } else if (args.safePlaceDensity > 8) {
    score += 10;
    factors.push("More open safe places");
  }
  if (args.fatigueScore > 0) {
    score -= Math.min(15, Math.round(args.fatigueScore * 0.15));
    factors.push("Worker fatigue");
  }
  if (args.detourPercent > 15) {
    score -= 10;
    factors.push("Longer detour");
  }

  const safetyScore = clampScore(score);
  return { safetyScore, classification: classifyRoute(safetyScore), riskFactors: factors };
}
