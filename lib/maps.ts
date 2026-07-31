import { scoreRoute } from "@/lib/safety";
import type { Coordinate, RouteOption } from "@/lib/types";

const OPENROUTESERVICE_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
const REQUEST_TIMEOUT_MS = 7000;
const CACHE_TTL_MS = 10 * 60 * 1000;

type RouteRequest = {
  origin: string;
  destination: string;
  departureTime: string;
  fatigueScore: number;
  originCoordinates?: Coordinate;
  destinationCoordinates?: Coordinate;
  waypoints?: Coordinate[];
};

type CachedRoute = {
  expiresAt: number;
  routes: NormalizedOpenRouteServiceRoute[];
};

type NormalizedOpenRouteServiceRoute = {
  id: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: {
    type: "LineString";
    coordinates: Coordinate[];
  };
  summary: string;
};

type OpenRouteServiceFeature = {
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
  properties?: {
    summary?: {
      distance?: unknown;
      duration?: unknown;
    };
  };
};

type OpenRouteServiceResponse = {
  features?: OpenRouteServiceFeature[];
};

class RoutingProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoutingProviderError";
  }
}

const routeCache = new Map<string, CachedRoute>();

const bengaluruCoordinates: Record<string, Coordinate> = {
  indiranagar: [77.6408, 12.9719],
  koramangala: [77.6245, 12.9352],
  "hsr layout": [77.6382, 12.9116],
  "btm layout": [77.6101, 12.9166],
  jayanagar: [77.5838, 12.925],
  "jp nagar": [77.5855, 12.9077],
  whitefield: [77.7499, 12.9698],
  mahadevapura: [77.6953, 12.9913],
  "mg road": [77.6068, 12.9759],
  yelahanka: [77.5946, 13.1007]
};

function isValidCoordinate(value: Coordinate) {
  const [longitude, latitude] = value;
  return Number.isFinite(longitude) && Number.isFinite(latitude) && longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
}

function parseCoordinateText(value: string): Coordinate | null {
  const parts = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));
  if (parts.length !== 2) return null;
  const coordinate: Coordinate = [parts[0], parts[1]];
  return isValidCoordinate(coordinate) ? coordinate : null;
}

function resolveCoordinate(label: string, explicit?: Coordinate): Coordinate | null {
  if (explicit) return isValidCoordinate(explicit) ? explicit : null;
  const fromText = parseCoordinateText(label);
  if (fromText) return fromText;
  return bengaluruCoordinates[label.trim().toLowerCase()] ?? null;
}

function cacheKey(coordinates: Coordinate[]) {
  return JSON.stringify(coordinates.map(([longitude, latitude]) => [Number(longitude.toFixed(6)), Number(latitude.toFixed(6))]));
}

function normalizeGeometryCoordinates(value: unknown): Coordinate[] {
  if (!Array.isArray(value)) {
    throw new RoutingProviderError("OpenRouteService returned route geometry in an unexpected format.");
  }

  const coordinates = value.map((point) => {
    if (!Array.isArray(point) || point.length < 2) {
      throw new RoutingProviderError("OpenRouteService returned malformed route coordinates.");
    }
    const coordinate: Coordinate = [Number(point[0]), Number(point[1])];
    if (!isValidCoordinate(coordinate)) {
      throw new RoutingProviderError("OpenRouteService returned invalid coordinate values.");
    }
    return coordinate;
  });

  if (coordinates.length < 2) {
    throw new RoutingProviderError("OpenRouteService returned a route without enough geometry points.");
  }

  return coordinates;
}

function normalizeOpenRouteServiceResponse(payload: OpenRouteServiceResponse): NormalizedOpenRouteServiceRoute[] {
  const features = payload.features ?? [];
  if (features.length === 0) {
    throw new RoutingProviderError("OpenRouteService did not find a route.");
  }

  return features.map((feature, index) => {
    const distanceMeters = Number(feature.properties?.summary?.distance);
    const durationSeconds = Number(feature.properties?.summary?.duration);
    const coordinates = normalizeGeometryCoordinates(feature.geometry?.coordinates);

    if (!Number.isFinite(distanceMeters) || distanceMeters <= 0 || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new RoutingProviderError("OpenRouteService returned a malformed route summary.");
    }

    return {
      id: `ors-route-${index + 1}`,
      distanceMeters,
      durationSeconds,
      geometry: { type: "LineString", coordinates },
      summary: `${Math.round(distanceMeters / 100) / 10} km, ${Math.round(durationSeconds / 60)} min by driving-car`
    };
  });
}

async function fetchOpenRouteServiceRoutes(coordinates: Coordinate[]): Promise<NormalizedOpenRouteServiceRoute[]> {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    throw new RoutingProviderError("OPENROUTESERVICE_API_KEY is missing.");
  }

  const key = cacheKey(coordinates);
  const cached = routeCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.routes;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTESERVICE_DIRECTIONS_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        coordinates,
        instructions: false,
        geometry: true,
        elevation: false
      }),
      signal: controller.signal
    });

    if (response.status === 401 || response.status === 403) {
      throw new RoutingProviderError("OpenRouteService authentication failed.");
    }
    if (response.status === 429) {
      throw new RoutingProviderError("OpenRouteService rate limit reached.");
    }
    if (response.status >= 500) {
      throw new RoutingProviderError("OpenRouteService is temporarily unavailable.");
    }
    if (!response.ok) {
      throw new RoutingProviderError(`OpenRouteService request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as OpenRouteServiceResponse;
    const routes = normalizeOpenRouteServiceResponse(payload);
    routeCache.set(key, { routes, expiresAt: Date.now() + CACHE_TTL_MS });
    return routes;
  } catch (error) {
    if (error instanceof RoutingProviderError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new RoutingProviderError("OpenRouteService request timed out.");
    }
    throw new RoutingProviderError("OpenRouteService request could not be completed.");
  } finally {
    clearTimeout(timeout);
  }
}

function applySafetyScoring(args: {
  routes: NormalizedOpenRouteServiceRoute[];
  originLabel: string;
  destinationLabel: string;
  originCoordinate: Coordinate | null;
  destinationCoordinate: Coordinate | null;
  departureTime: string;
  fatigueScore: number;
  provider: RouteOption["provider"];
}): RouteOption[] {
  const options = args.routes.map((route) => {
    const distanceKm = Math.round((route.distanceMeters / 1000) * 10) / 10;
    const etaMinutes = Math.round(route.durationSeconds / 60);
    const scored = scoreRoute({
      distanceKm,
      etaMinutes,
      departureTime: args.departureTime,
      weather: "rain",
      incidentHotspotLevel: 0,
      safePlaceDensity: 7,
      fatigueScore: args.fatigueScore,
      detourPercent: 0
    });

    return {
      id: route.id,
      name: route.summary,
      distanceKm,
      distanceMeters: Math.round(route.distanceMeters),
      etaMinutes,
      durationSeconds: Math.round(route.durationSeconds),
      geometry: route.geometry,
      summary: route.summary,
      origin: { label: args.originLabel, coordinate: args.originCoordinate },
      destination: { label: args.destinationLabel, coordinate: args.destinationCoordinate },
      provider: args.provider,
      weather: "rain",
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

export async function getRouteOptions(args: RouteRequest): Promise<RouteOption[]> {
  const originCoordinate = resolveCoordinate(args.origin, args.originCoordinates);
  const destinationCoordinate = resolveCoordinate(args.destination, args.destinationCoordinates);
  const waypoints = args.waypoints ?? [];

  if (!originCoordinate || !destinationCoordinate || waypoints.some((coordinate) => !isValidCoordinate(coordinate))) {
    throw new RoutingProviderError("Invalid or unresolved coordinates.");
  }

  const coordinates = [originCoordinate, ...waypoints, destinationCoordinate];

  const routes = await fetchOpenRouteServiceRoutes(coordinates);
  return applySafetyScoring({
    routes,
    originLabel: args.origin,
    destinationLabel: args.destination,
    originCoordinate,
    destinationCoordinate,
    departureTime: args.departureTime,
    fatigueScore: args.fatigueScore,
    provider: "openrouteservice"
  });
}

export const openRouteServiceDiagnostics = {
  provider: "OpenRouteService Directions API",
  endpoint: OPENROUTESERVICE_DIRECTIONS_URL,
  profile: "driving-car",
  geometry: "GeoJSON",
  cacheTtlMs: CACHE_TTL_MS,
  timeoutMs: REQUEST_TIMEOUT_MS
};
