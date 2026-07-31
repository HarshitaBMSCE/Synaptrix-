import { PhoneCall, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RoutePlanner } from "@/components/route-planner";
import { Card } from "@/components/ui";

export default function RoutesPage() {
  return (
    <AppShell title="Route safety" subtitle="Server-side Google Routes adapter with seeded Bengaluru fallback and Open-Meteo-ready weather inputs.">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <RoutePlanner />
          <p className="mt-4 text-xs text-muted-foreground">Guidance only — this score cannot guarantee safety.</p>
        </Card>
        <Card>
          <ShieldAlert className="text-red-600" size={28} />
          <h2 className="mt-3 text-lg font-bold">I feel unsafe</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            GigShield prepares an alert with worker name, last location, route, timestamp, and a short message. You preview recipients and content before sharing.
          </p>
          <div className="mt-4 rounded-lg border border-border bg-muted p-4 text-sm">
            “I may be unsafe near Koramangala at 10:42 PM. Please call me and keep this route open: [location link].”
          </div>
          <div className="mt-4 grid gap-2">
            <button className="min-h-11 rounded-md bg-red-600 px-4 font-semibold text-white" type="button"><PhoneCall className="mr-2 inline" size={18} />Call trusted contact</button>
            <button className="min-h-11 rounded-md border border-border bg-white px-4 font-semibold" type="button">Copy message</button>
            <button className="min-h-11 rounded-md border border-border bg-white px-4 font-semibold" type="button">Start check-in countdown</button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">The app never claims delivery without channel confirmation.</p>
        </Card>
      </div>
    </AppShell>
  );
}
