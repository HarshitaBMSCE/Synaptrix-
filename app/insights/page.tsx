import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";
import { weeklyNarrative } from "@/lib/claude";

export default async function InsightsPage() {
  const summary = await getDashboardSummary(await getCurrentUserId(), "weekly");
  const narrative = await weeklyNarrative({
    gross: summary.gross,
    net: summary.net,
    activeMinutes: summary.activeMinutes,
    waitingMinutes: summary.waitingMinutes,
    estimatedCosts: summary.estimatedOperatingCost,
    underpaymentGap: summary.underpaymentGap,
    strongestPlatform: summary.platformComparison[0]?.platform,
    fatigueScore: summary.fatigueScore,
    savingsProgress: summary.savingsGoal.currentAmount
  });
  return (
    <AppShell title="Weekly insights" subtitle="Deterministic metrics first, Claude narrative second, with copy/download/report controls.">
      <Card>
        <div className="flex flex-wrap gap-2">
          <Badge tone="green">English</Badge>
          <Badge>Hindi</Badge>
          <Badge>Kannada</Badge>
        </div>
        <h2 className="mt-4 text-2xl font-bold">This week</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{narrative.narrative}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-white p-4"><p className="font-bold">Insight</p><p className="text-sm text-muted-foreground">{narrative.insight}</p></div>
          <div className="rounded-lg border border-border bg-white p-4"><p className="font-bold">Risk</p><p className="text-sm text-muted-foreground">{narrative.risk}</p></div>
          <div className="rounded-lg border border-border bg-white p-4"><p className="font-bold">Action</p><p className="text-sm text-muted-foreground">{narrative.action}</p></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="min-h-11 rounded-md border border-border bg-white px-4 font-semibold" type="button">Copy</button>
          <button className="min-h-11 rounded-md border border-border bg-white px-4 font-semibold" type="button">Download PDF</button>
          <button className="min-h-11 rounded-md border border-border bg-white px-4 font-semibold" type="button">Save to evidence vault</button>
          <button className="min-h-11 rounded-md border border-red-200 bg-red-50 px-4 font-semibold text-red-700" type="button">Delete saved report</button>
        </div>
      </Card>
    </AppShell>
  );
}
