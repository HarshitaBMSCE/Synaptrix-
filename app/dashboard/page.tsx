import { AlertTriangle, Clock, PiggyBank, Route, ShieldCheck, WalletCards, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EarningsTrend, HoursChart, PlatformSplit } from "@/components/charts";
import { Badge, ButtonLink, Card, EmptyState } from "@/components/ui";
import { getCurrentAppUser } from "@/lib/auth";
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
  const user = await getCurrentAppUser();
  const summary = await getDashboardSummary(user.clerkUserId, "weekly");

  const cards = [
    { label: "Net earnings", value: money(summary.net), detail: `${money(summary.trueIncome)} after operating costs`, icon: WalletCards, tone: "green" as const },
    { label: "Active hours", value: `${Math.round(summary.activeMinutes / 6) / 10}h`, detail: `${Math.round(summary.waitingMinutes / 6) / 10}h waiting`, icon: Clock, tone: "neutral" as const },
    { label: "Fairness status", value: `${summary.fairnessAverage}/100`, detail: `${summary.flaggedJobs} flagged jobs`, icon: ShieldCheck, tone: toneForScore(summary.fairnessAverage) },
    { label: "Fatigue score", value: fatigueStatus(summary.fatigueScore), detail: `${summary.fatigueScore}/100 guidance score`, icon: AlertTriangle, tone: toneForScore(100 - summary.fatigueScore) },
    {
      label: "Savings target",
      value: summary.savingsGoal.targetAmount > 0 ? `${Math.round((summary.savingsGoal.currentAmount / summary.savingsGoal.targetAmount) * 100)}%` : "Not set",
      detail: `${money(summary.savingsGoal.currentAmount)} of ${money(summary.savingsGoal.targetAmount)}`,
      icon: PiggyBank,
      tone: "green" as const
    }
  ];

  return (
    <AppShell title="Dashboard" subtitle="Your private earnings, fairness, route, fatigue, and savings workspace.">
      {/* Top Banner Greetings & Badges */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E7E7EA] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Welcome back</span>
          <h2 className="text-2xl font-black text-[#202124] mt-0.5">Hello, {user.displayName || "Worker"}</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Date range: Jul 24 - Jul 31, 2026 (Weekly pilot)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user.isDemo ? (
            <Badge tone="amber">Demo Mode active</Badge>
          ) : (
            <Badge tone="green">Verified Account</Badge>
          )}
          {user.role === "admin" ? (
            <div className="flex items-center gap-2">
              <Badge tone="green">Admin</Badge>
              <Link href="/admin" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Admin Console <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <Badge tone="neutral">Worker Role</Badge>
          )}
        </div>
      </div>

      {/* Main Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
              <card.icon className="text-primary" size={20} />
              <Badge tone={card.tone}>{card.label}</Badge>
            </div>
            <p className="text-3xl font-black text-[#202124]">{card.value}</p>
            <p className="mt-1.5 text-xs text-slate-500 leading-normal">{card.detail}</p>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#202124]">Earnings and underpayment trend</h3>
              <p className="text-xs text-slate-400">Weekly tracking of net payout versus fair benchmark gaps</p>
            </div>
            <ButtonLink href="/jobs/new" variant="secondary">Add job</ButtonLink>
          </div>
          {summary.trend.length > 0 ? (
            <EarningsTrend data={summary.trend} />
          ) : (
            <EmptyState title="No earnings logged yet" body="Add your first job to see earnings and underpayment trends." action={<ButtonLink href="/jobs/new">Add first job</ButtonLink>} />
          )}
        </Card>

        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#202124]">Platform split</h3>
            <p className="text-xs text-slate-400">Share of net earnings across platform partners</p>
          </div>
          {summary.platformComparison.length > 0 ? (
            <PlatformSplit data={summary.platformComparison} />
          ) : (
            <EmptyState title="No platform data" body="Platform comparison appears after you save jobs." />
          )}
        </Card>
      </div>

      {/* Hours Chart & Action Queue */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#202124]">Active versus waiting hours</h3>
            <p className="text-xs text-slate-400">Ratio of time spent on delivery/rides versus waiting for orders</p>
          </div>
          {summary.trend.length > 0 ? (
            <HoursChart data={summary.trend} />
          ) : (
            <EmptyState title="No work hours logged" body="Active and waiting hours will appear after job entries." />
          )}
        </Card>

        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#202124]">Action Queue</h3>
            <p className="text-xs text-slate-400">Suggested tasks to protect your work and optimize settings</p>
          </div>
          <div className="space-y-3">
            {[
              { href: "/jobs/new", title: "Log manual job", body: "Save details to calculate your local Bengaluru fairness verdict." },
              { href: "/jobs/scan", title: "Upload screenshot evidence", body: "Upload payout screenshots for secure S3 evidence archiving." },
              { href: "/routes", title: "Compare route safety", body: "Check weather alerts and incident risk levels before your shift." },
              { href: "/savings", title: "Set savings target", body: "Define scooter repair or emergency buffer targets." }
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors">
                <p className="font-bold text-sm text-[#202124]">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">{item.body}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Platform Comparison details */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#202124]">Platform Performance Comparison</h3>
            <p className="text-xs text-slate-400">Compare rates, averages, and deduction metrics between platforms</p>
          </div>
          {summary.platformComparison.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {summary.platformComparison.map((platform) => (
                <div key={platform.platform} className="rounded-xl border border-[#E7E7EA] bg-white p-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3 mb-3">
                    <h4 className="font-bold text-[#202124]">{platform.platform}</h4>
                    <Badge tone={toneForScore(platform.fairnessAverage)}>{platform.fairnessAverage}/100</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs leading-normal font-semibold text-slate-600">
                    <div className="p-2.5 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-400">Net earnings</p>
                      <p className="text-sm font-bold text-[#202124] mt-0.5">{money(platform.netEarnings)}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-400">Hourly average</p>
                      <p className="text-sm font-bold text-[#202124] mt-0.5">₹{platform.netPerHour}/hr</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-400">Distance rate</p>
                      <p className="text-sm font-bold text-[#202124] mt-0.5">₹{platform.payPerKm}/km</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-400">Deductions rate</p>
                      <p className="text-sm font-bold text-[#202124] mt-0.5">{platform.deductionRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No platform comparisons yet" body="Metrics will compare platforms automatically as jobs are recorded." />
          )}
        </Card>

        {/* Safety Warning Card */}
        <Card className="flex flex-col justify-between border-amber-200 bg-amber-50/20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Route size={20} />
              </div>
              <h3 className="font-bold text-lg text-[#202124]">Safety Notice</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Estimates, weather risk scoring, and fatigue alerts are guides only. They do not guarantee the safety of any route or environment. Preview trusted-contact alerts before sharing.
            </p>
          </div>
          <div className="mt-6">
            <ButtonLink href="/routes" variant="secondary" className="w-full">
              Compare routes
            </ButtonLink>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
