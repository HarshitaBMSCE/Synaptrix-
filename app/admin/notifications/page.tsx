import { AdminShell } from "@/components/admin-shell";
import { Card, Field, inputClass } from "@/components/ui";
import { Bell, Send } from "lucide-react";

export default async function AdminNotificationsPage() {
  return (
    <AdminShell title="System Notifications Broadcaster">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Dispatch system push notifications or in-app alerts to target worker audiences.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#202124]">Broadcast Dispatcher Form</h3>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Target Audience Selection" hint="Determine which segments of active profiles receive this alert">
              <select className={inputClass}>
                <option>All active workers</option>
                <option>Workers with fatigue alerts today</option>
                <option>Bengaluru pilot region only</option>
              </select>
            </Field>

            <Field label="Notification Title">
              <input className={inputClass} placeholder="e.g. Warning: Heavy rain expected in Koramangala" />
            </Field>

            <Field label="Message Body" hint="Avoid sharing private financial metrics inside push bodies">
              <textarea className={`${inputClass} min-h-24 w-full`} placeholder="Enter the brief message details..." />
            </Field>
          </div>

          <div className="pt-2">
            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-[#D84315] text-sm font-bold text-white shadow-sm shadow-primary/10 transition-colors"
              type="button"
            >
              <Send size={16} /> Dispatch notification broadcast
            </button>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
