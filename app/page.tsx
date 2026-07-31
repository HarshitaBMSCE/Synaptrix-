import { ArrowRight, Languages, MapPinned, ShieldCheck, WalletCards } from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-[92vh] max-w-6xl content-center gap-10 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div className="self-center">
          <Badge tone="green">Bengaluru demo ready</Badge>
          <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-normal text-slate-950 md:text-7xl">GigShield</h1>
          <p className="mt-3 text-xl font-semibold text-primary">Fair pay. Safer routes. Stronger workers.</p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            A mobile-first PWA for delivery riders, cab drivers, bike-taxi riders, couriers, and home-service workers to log jobs, check fair payment,
            draft complaints, compare route safety, track fatigue, and prepare trusted-contact alerts.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/demo">Open demo <ArrowRight className="ml-2" size={18} /></ButtonLink>
            <ButtonLink href="/sign-up" variant="secondary">Create account</ButtonLink>
          </div>
          <p className="mt-6 max-w-xl text-sm text-muted-foreground">
            Demo mode uses seeded Bengaluru records when Clerk, MongoDB, Claude, AWS S3, or Google Maps credentials are not configured.
          </p>
        </div>
        <div className="grid gap-4 self-center">
          {[
            { icon: WalletCards, title: "Fairness engine", body: "Deterministic expected pay, operating cost, distance accuracy, transparency, and community benchmark blending." },
            { icon: MapPinned, title: "Route and fatigue guardrails", body: "Traffic-unaware route alternatives, weather-aware safety scoring, long-hours warnings, and SOS preview." },
            { icon: ShieldCheck, title: "Evidence vault", body: "Private S3-ready uploads, review-before-save screenshot extraction, complaint drafts, and short-lived access links." },
            { icon: Languages, title: "English, Hindi, Kannada", body: "Localized main workflows plus AI translation fallbacks that preserve numbers and platform names." }
          ].map((item) => (
            <Card key={item.title} className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <item.icon size={22} />
              </div>
              <div>
                <h2 className="font-bold">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
