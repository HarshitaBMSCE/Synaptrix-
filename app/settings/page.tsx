import { AppShell } from "@/components/app-shell";
import { Card, Field, inputClass } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getProfile } from "@/lib/repository";

export default async function SettingsPage() {
  const profile = await getProfile(await getCurrentUserId());
  return (
    <AppShell title="Settings" subtitle="Profile, language, platform, consent, emergency contacts, and notification preferences.">
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="font-bold">Worker profile</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Language">
              <select className={inputClass} defaultValue={profile.preferredLanguage}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
              </select>
            </Field>
            <Field label="Platforms used">
              <input className={inputClass} defaultValue={profile.platformsUsed.join(", ")} />
            </Field>
            <Field label="Trusted contact">
              <input className={inputClass} defaultValue={`${profile.emergencyContacts[0]?.name} ${profile.emergencyContacts[0]?.phone}`} />
            </Field>
          </div>
        </Card>
        <Card>
          <h2 className="font-bold">Notifications and consent</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {Object.entries(profile.notificationPreferences).map(([key, enabled]) => (
              <label key={key} className="flex items-center justify-between rounded-md border border-border bg-white p-3">
                <span>{key}</span>
                <input type="checkbox" defaultChecked={enabled} />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
