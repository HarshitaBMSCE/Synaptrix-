import { AppShell } from "@/components/app-shell";
import { Card, Field, inputClass } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getProfile } from "@/lib/repository";

export default async function OnboardingPage() {
  const profile = await getProfile(await getCurrentUserId());
  return (
    <AppShell title="Onboarding" subtitle="Set language, worker profile, consent, emergency contact, and earning assumptions.">
      <Card>
        <form className="grid gap-4 md:grid-cols-2">
          <Field label="Display name">
            <input className={inputClass} defaultValue={profile.displayName} />
          </Field>
          <Field label="Preferred language">
            <select className={inputClass} defaultValue={profile.preferredLanguage}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="kn">Kannada</option>
            </select>
          </Field>
          <Field label="Worker type">
            <select className={inputClass} defaultValue={profile.workerType}>
              <option value="food-delivery">Food-delivery rider</option>
              <option value="grocery-delivery">Grocery-delivery rider</option>
              <option value="cab-driver">Cab driver</option>
              <option value="bike-taxi">Bike-taxi rider</option>
              <option value="courier">Courier worker</option>
              <option value="home-service">Home-service worker</option>
            </select>
          </Field>
          <Field label="City">
            <input className={inputClass} defaultValue={profile.city} />
          </Field>
          <Field label="Operating cost per km">
            <input className={inputClass} type="number" defaultValue={profile.operatingCostPerKm} />
          </Field>
          <Field label="Hourly earnings floor">
            <input className={inputClass} type="number" defaultValue={profile.hourlyEarningsFloor} />
          </Field>
          <div className="md:col-span-2 grid gap-2 rounded-lg border border-border bg-muted p-4 text-sm">
            {[
              "Retain screenshots only with consent",
              "Contribute anonymized community benchmark data",
              "Use approximate location for route safety",
              "Use microphone for voice entry",
              "Opt into granular notifications"
            ].map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                {item}
              </label>
            ))}
          </div>
          <button className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground md:col-span-2">Save profile</button>
        </form>
      </Card>
    </AppShell>
  );
}
