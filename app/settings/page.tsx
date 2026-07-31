import { AppShell } from "@/components/app-shell";
import { Card, Field, inputClass } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { openRouteServiceDiagnostics } from "@/lib/maps";
import { getProfile } from "@/lib/repository";
import { User, Bell, Settings2, Info } from "lucide-react";

export default async function SettingsPage() {
  const profile = await getProfile(await getCurrentUserId());

  return (
    <AppShell title="Settings" subtitle="Profile, language, platform, consent, emergency contacts, and notification preferences.">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Worker Profile details */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User size={16} />
              </div>
              <h3 className="font-bold text-base text-[#202124]">Worker Profile</h3>
            </div>
            
            <div className="space-y-4">
              <Field label="Language preference">
                <select className={inputClass} defaultValue={profile.preferredLanguage}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                </select>
              </Field>

              <Field label="Platforms used" hint="Platform IDs separated by commas">
                <input className={inputClass} defaultValue={profile.platformsUsed.join(", ")} />
              </Field>

              <Field label="Emergency trusted contact" hint="Name and telephone number">
                <input className={inputClass} defaultValue={profile.emergencyContacts[0] ? `${profile.emergencyContacts[0].name} ${profile.emergencyContacts[0].phone}` : ""} placeholder="e.g. Ramesh +91 98765 43210" />
              </Field>
            </div>
            
            <button className="min-h-12 w-full rounded-xl bg-primary hover:bg-[#D84315] text-sm font-bold text-white shadow-sm shadow-primary/10 transition-colors mt-2" type="button">
              Save worker profile
            </button>
          </Card>

          {/* Route Service diagnostics */}
          <Card className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Settings2 size={16} />
              </div>
              <h3 className="font-bold text-base text-[#202124]">Routing & Map Diagnostics</h3>
            </div>

            <div className="space-y-3 text-xs leading-normal">
              <div className="rounded-xl border border-slate-100 bg-[#F7F7F8] p-4 font-semibold text-slate-600 flex justify-between">
                <span className="text-slate-400">Map Routing Provider</span>
                <span className="font-bold text-[#202124]">{openRouteServiceDiagnostics.provider}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-[#F7F7F8] p-4 font-semibold text-slate-600 flex justify-between">
                <span className="text-slate-400">Profile & Geometry</span>
                <span className="font-bold text-[#202124]">{openRouteServiceDiagnostics.profile} • {openRouteServiceDiagnostics.geometry}</span>
              </div>
              
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-[10px] text-slate-500 leading-relaxed flex items-start gap-2">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Routing Status:</strong> Route geometry is requested from OpenRouteService using server-side credentials. Fairness scoring remains deterministic and independent from map providers.
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column: Notification preferences checklist */}
        <div>
          <Card className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Bell size={16} />
              </div>
              <h3 className="font-bold text-base text-[#202124]">Notification Preferences</h3>
            </div>

            <div className="space-y-2">
              {Object.entries(profile.notificationPreferences).map(([key, enabled]) => (
                <label key={key} className="flex items-center justify-between rounded-xl border border-[#E7E7EA] bg-white p-4 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50/50 transition-colors">
                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1")} notifications</span>
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" defaultChecked={enabled} />
                </label>
              ))}
            </div>
            
            <button className="min-h-12 w-full rounded-xl bg-primary hover:bg-[#D84315] text-sm font-bold text-white shadow-sm shadow-primary/10 transition-colors mt-2" type="button">
              Save alerts config
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
