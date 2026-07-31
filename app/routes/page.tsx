import { PhoneCall, ShieldAlert, Clipboard, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RoutePlanner } from "@/components/route-planner";
import { Card, Badge } from "@/components/ui";

export default function RoutesPage() {
  return (
    <AppShell title="Route Safety & Security" subtitle="OpenRouteService route details, weather hazard indicators, and emergency SOS check-ins.">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        
        {/* Left Side: Route Planner (origin, destination search & alternatives) */}
        <Card className="space-y-6">
          <div className="border-b border-slate-50 pb-4 mb-4">
            <h3 className="font-bold text-base text-[#202124]">Compare route alternatives</h3>
            <p className="text-xs text-slate-400 mt-0.5">Check weather and road safety risk estimates before starting a delivery.</p>
          </div>
          
          <RoutePlanner />
          
          <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-50 pt-4">
            * Route metrics and safety assessments are informational guidance only and cannot guarantee safety.
          </p>
        </Card>

        {/* Right Side: Unsafe Alert Panel */}
        <div className="space-y-6">
          <Card className="border-red-100 bg-red-50/10">
            <div className="flex items-center gap-3 border-b border-red-50 pb-4 mb-4">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#202124]">Emergency SOS Alert</h3>
                <Badge tone="red">Not sent</Badge>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              If you feel unsafe on a route, GigShield prepares a pre-formatted alert with your name, last coordinates, route details, and timestamp.
            </p>

            <div className="mt-4 rounded-xl border border-red-100 bg-white p-4 text-xs font-semibold text-slate-700 leading-relaxed">
              “I may be unsafe near Koramangala at 10:42 PM. Please call me and keep this route open: [location link].”
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-bold text-white shadow-sm transition-all"
                type="button"
              >
                <PhoneCall size={16} /> Call trusted contact
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                  type="button"
                >
                  <Clipboard size={14} /> Copy SMS alert
                </button>
                <button
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                  type="button"
                >
                  <Clock size={14} /> Safety countdown
                </button>
              </div>
            </div>
            
            <p className="mt-4 text-[10px] text-slate-400 text-center leading-normal">
              GigShield never automatically shares your location. Preview contacts and message details before copying.
            </p>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
