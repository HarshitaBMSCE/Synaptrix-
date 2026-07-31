import { AppShell } from "@/components/app-shell";
import { Card, Field, inputClass } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getProfile } from "@/lib/repository";
import { UserCheck } from "lucide-react";

export default async function OnboardingPage() {
  const profile = await getProfile(await getCurrentUserId());
  return (
    <AppShell title="Profile Onboarding" subtitle="Configure your language, worker profile, and operating cost baselines.">
      <div className="max-w-4xl">
        <Card className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#202124]">Personal Profile Details</h3>
              <p className="text-xs text-slate-400">These details help us calculate your localized Bengaluru fairness verdict.</p>
            </div>
          </div>

          <form className="grid gap-6 md:grid-cols-2">
            <Field label="Display name" hint="Your profile display username">
              <input className={inputClass} placeholder="e.g. Ramesh Kumar" defaultValue={profile.displayName} />
            </Field>
            
            <Field label="Preferred language" hint="Select localized app workflow language">
              <select className={inputClass} defaultValue={profile.preferredLanguage}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
              </select>
            </Field>

            <Field label="Worker type" hint="Gig category you operate in">
              <select className={inputClass} defaultValue={profile.workerType}>
                <option value="food-delivery">Food-delivery rider</option>
                <option value="grocery-delivery">Grocery-delivery rider</option>
                <option value="cab-driver">Cab driver</option>
                <option value="bike-taxi">Bike-taxi rider</option>
                <option value="courier">Courier worker</option>
                <option value="home-service">Home-service worker</option>
              </select>
            </Field>
            
            <Field label="City pilot location" hint="Assumptions apply to pilot regions only">
              <input className={inputClass} defaultValue={profile.city} />
            </Field>

            <Field label="Operating cost per km (₹)" hint="Include fuel, vehicle wear, and maintenance estimate">
              <input className={inputClass} type="number" step="0.1" defaultValue={profile.operatingCostPerKm} />
            </Field>

            <Field label="Hourly earnings floor (₹)" hint="Minimum acceptable hourly wage standard">
              <input className={inputClass} type="number" defaultValue={profile.hourlyEarningsFloor} />
            </Field>

            <div className="md:col-span-2 grid gap-3 rounded-2xl border border-slate-100 bg-[#F7F7F8] p-5 text-xs font-bold text-slate-700">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Consent & Options Settings</p>
              {[
                "Retain screenshots only with explicit consent",
                "Contribute anonymized community benchmark data",
                "Use approximate location coordinates for route safety check",
                "Use microphone features for voice transcripts parsing",
                "Opt into system notification alerts"
              ].map((item) => (
                <label key={item} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" defaultChecked />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            
            <button className="min-h-12 rounded-xl bg-primary hover:bg-[#D84315] text-sm font-bold text-white shadow-sm shadow-primary/10 md:col-span-2 transition-colors duration-200">
              Save worker profile
            </button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
