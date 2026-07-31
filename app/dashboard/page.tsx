import { AlertTriangle, Clock, PiggyBank, Route, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EarningsTrend, HoursChart, PlatformSplit } from "@/components/charts";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";
import { fatigueStatus } from "@/lib/safety";

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function toneForScore(score: number) {
  if (score >= 80) return "green" as const;
  if (score >= 60) return "amber" as const;
  return "red" as const;
}

export default async function DashboardPage() {
  const summary = await getDashboardSummary(await getCurrentUserId(), "weekly");
  const cards = [
    { label: "Today’s net earnings", value: money(summary.net), detail: `${money(summary.trueIncome)} after estimated costs`, icon: WalletCards, tone: "green" as const },
    { label: "Active working time", value: `${Math.round(summary.activeMinutes / 6) / 10}h`, detail: `${Math.round(summary.waitingMinutes / 6) / 10}h waiting`, icon: Clock, tone: "neutral" as const },
    { label: "Fairness status", value: `${summary.fairnessAverage}/100`, detail: `${summary.flaggedJobs} flagged jobs`, icon: ShieldCheck, tone: toneForScore(summary.fairnessAverage) },
    { label: "Fatigue status", value: fatigueStatus(summary.fatigueScore), detail: `${summary.fatigueScore}/100 guidance score`, icon: AlertTriangle, tone: toneForScore(100 - summary.fatigueScore) },
    {
      label: "Savings progress",
      value: `${Math.round((summary.savingsGoal.currentAmount / summary.savingsGoal.targetAmount) * 100)}%`,
      detail: `${money(summary.savingsGoal.currentAmount)} of ${money(summary.savingsGoal.targetAmount)}`,
      icon: PiggyBank,
      tone: "green" as const
    }
  ];

  return (
    <AppShell title="Dashboard" subtitle="Demo mode: seeded Bengaluru earnings, route, fatigue, and community records.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <div className="flex items-center justify-between gap-3">
              <card.icon className="text-primary" size={22} />
              <Badge tone={card.tone}>{card.label}</Badge>
            </div>
            <p className="mt-4 text-3xl font-black">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Earnings and underpayment trend</h2>
            <ButtonLink href="/jobs/new" variant="secondary">Add job</ButtonLink>
          </div>
          <EarningsTrend data={summary.trend} />
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Platform split</h2>
          <PlatformSplit data={summary.platformComparison} />
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Active versus waiting hours</h2>
          <HoursChart data={summary.trend} />
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Action queue</h2>
          <div className="mt-4 grid gap-3">
            {[
              { href: "/jobs/job-101", title: "Review low-confidence screenshot", body: "Swiggy deduction label needs confirmation." },
              { href: "/complaints/complaint-1", title: "Finish complaint draft", body: "Two jobs include unexplained deduction evidence." },
              { href: "/routes", title: "Check safer route", body: "Rain and fatigue may change route recommendation." },
              { href: "/savings", title: "Confirm savings transfer", body: "Suggested transfer: ₹250, below safe percentage." }
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg border border-border bg-white p-3 hover:bg-muted">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-lg font-bold">Platform comparison</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {summary.platformComparison.map((platform) => (
              <div key={platform.platform} className="rounded-lg border border-border bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold">{platform.platform}</h3>
                  <Badge tone={toneForScore(platform.fairnessAverage)}>{platform.fairnessAverage}/100</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <span>Net {money(platform.netEarnings)}</span>
                  <span>₹{platform.netPerHour}/hr</span>
                  <span>₹{platform.payPerKm}/km</span>
                  <span>{platform.deductionRate}% deductions</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Route className="text-primary" />
          <h2 className="mt-3 text-lg font-bold">Safety notice</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Route scores are guidance only and cannot guarantee safety. Preview trusted-contact alerts before sharing.
          </p>
          <div className="mt-4">
            <ButtonLink href="/routes">Compare routes</ButtonLink>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
