"use client";

import { useState } from "react";
import { Badge, inputClass } from "@/components/ui";
import type { RouteOption } from "@/lib/types";
import { Navigation, Cloud } from "lucide-react";

export function RoutePlanner() {
  const [origin, setOrigin] = useState("Indiranagar");
  const [destination, setDestination] = useState("Koramangala");
  const [departureTime, setDepartureTime] = useState(new Date().toISOString());
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);

  async function compare() {
    setLoading(true);
    try {
      const response = await fetch("/api/routes/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ origin, destination, departureTime })
      });
      const payload = await response.json();
      if (payload.ok) setRoutes(payload.data.routes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Route Inputs Panel */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Origin</label>
          <input className={inputClass + " w-full"} value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="e.g. Indiranagar" aria-label="Origin" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Destination</label>
          <input className={inputClass + " w-full"} value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Koramangala" aria-label="Destination" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Departure time</label>
          <input className={inputClass + " w-full"} type="datetime-local" value={departureTime.slice(0, 16)} onChange={(event) => setDepartureTime(new Date(event.target.value).toISOString())} aria-label="Departure time" />
        </div>
      </div>

      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm shadow-primary/10 hover:bg-[#D84315] disabled:opacity-60 transition-all duration-200"
        type="button"
        onClick={compare}
        disabled={loading}
      >
        <Navigation size={16} /> {loading ? "Evaluating routes..." : "Compare route safety"}
      </button>

      {/* Alternatives Comparison List */}
      {routes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Route Alternatives</h4>
            <Badge tone="green">Route results</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {routes.map((route) => {
              const score = route.safetyScore;
              const tone = score >= 80 ? "green" : score >= 60 ? "amber" : "red";

              return (
                <div key={route.id} className="rounded-xl border border-[#E7E7EA] bg-white p-5 flex flex-col justify-between space-y-4 hover:shadow-sm transition-all duration-200">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#202124]">{route.name}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          {route.distanceKm} km • {route.etaMinutes} min
                        </p>
                      </div>
                      <Badge tone={tone}>{score}/100</Badge>
                    </div>

                    {/* Metadata & weather */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <Cloud size={14} className="text-slate-400" />
                      <span className="capitalize">{route.weather} weather</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold bg-slate-100 rounded px-1.5 py-0.5 text-slate-500 uppercase tracking-wide">{route.provider}</span>
                    </div>

                    {/* Classification badges */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {route.fastest && <Badge tone="neutral">⚡ Fastest</Badge>}
                      {route.recommended && <Badge tone="green">🛡️ Recommended safer</Badge>}
                      <Badge tone={tone}>{route.classification}</Badge>
                    </div>
                  </div>

                  {/* Risks section */}
                  <div className="border-t border-slate-50 pt-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hazards & Risks</p>
                    <div className="flex flex-wrap gap-1.5">
                      {route.riskFactors.map((factor) => (
                        <span key={factor} className="inline-flex items-center rounded-lg bg-red-50 text-red-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
