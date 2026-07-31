"use client";

import { useState } from "react";
import { Badge, inputClass } from "@/components/ui";
import type { RouteOption } from "@/lib/types";

export function RoutePlanner() {
  const [origin, setOrigin] = useState("Indiranagar");
  const [destination, setDestination] = useState("Koramangala");
  const [departureTime, setDepartureTime] = useState(new Date().toISOString());
  const [routes, setRoutes] = useState<RouteOption[]>([]);

  async function compare() {
    const response = await fetch("/api/routes/score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ origin, destination, departureTime })
    });
    const payload = await response.json();
    if (payload.ok) setRoutes(payload.data.routes);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <input className={inputClass} value={origin} onChange={(event) => setOrigin(event.target.value)} aria-label="Origin" />
        <input className={inputClass} value={destination} onChange={(event) => setDestination(event.target.value)} aria-label="Destination" />
        <input className={inputClass} type="datetime-local" value={departureTime.slice(0, 16)} onChange={(event) => setDepartureTime(new Date(event.target.value).toISOString())} aria-label="Departure time" />
      </div>
      <button className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground" type="button" onClick={compare}>Compare route safety</button>
      <div className="grid gap-3 md:grid-cols-2">
        {routes.map((route) => (
          <div key={route.id} className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{route.name}</h3>
                <p className="text-sm text-muted-foreground">{route.distanceKm} km • {route.etaMinutes} min • {route.weather}</p>
              </div>
              <Badge tone={route.safetyScore >= 80 ? "green" : route.safetyScore >= 60 ? "amber" : "red"}>{route.safetyScore}/100</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {route.fastest ? <Badge>Fastest</Badge> : null}
              {route.recommended ? <Badge tone="green">Recommended safer</Badge> : null}
              <Badge tone={route.safetyScore >= 80 ? "green" : route.safetyScore >= 60 ? "amber" : "red"}>{route.classification}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {route.riskFactors.map((factor) => <Badge key={factor} tone="neutral">{factor}</Badge>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
