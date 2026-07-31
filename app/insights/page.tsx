import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";
import { weeklyNarrative } from "@/lib/claude";
import { Sparkles, Languages, Copy, FileText, Bookmark, Trash2, ShieldAlert } from "lucide-react";

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
    <AppShell title="Weekly Earnings Insights" subtitle="Deterministic metrics first, Claude narrative second, with copy/download/report controls.">
      <Card className="space-y-6">
        {/* Language Selection Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Languages size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#202124] uppercase tracking-wide">Language Translation</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Badge tone="green">English</Badge>
            <Badge tone="neutral">Hindi</Badge>
            <Badge tone="neutral">Kannada</Badge>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-primary">
            <Sparkles size={16} />
            <h3 className="font-bold text-sm uppercase tracking-wide">Claude Weekly Narrative</h3>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-medium leading-relaxed text-slate-700">
            {narrative.narrative}
          </div>
        </div>

        {/* Thematic Cards Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E7E7EA] bg-white p-5 hover:shadow-sm transition-all duration-200">
            <Badge tone="green" className="mb-3">Insight</Badge>
            <p className="text-xs font-semibold leading-relaxed text-slate-600">{narrative.insight}</p>
          </div>
          <div className="rounded-2xl border border-[#E7E7EA] bg-white p-5 hover:shadow-sm transition-all duration-200">
            <Badge tone="amber" className="mb-3">Risk Factor</Badge>
            <p className="text-xs font-semibold leading-relaxed text-slate-600">{narrative.risk}</p>
          </div>
          <div className="rounded-2xl border border-[#E7E7EA] bg-white p-5 hover:shadow-sm transition-all duration-200">
            <Badge tone="neutral" className="mb-3">Recommended Action</Badge>
            <p className="text-xs font-semibold leading-relaxed text-slate-600">{narrative.action}</p>
          </div>
        </div>

        {/* Action Controls footer */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
          <button className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 px-4 text-xs font-bold text-slate-700 transition-colors" type="button">
            <Copy size={14} className="text-slate-400" /> Copy report
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 px-4 text-xs font-bold text-slate-700 transition-colors" type="button">
            <FileText size={14} className="text-slate-400" /> Download PDF
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 px-4 text-xs font-bold text-slate-700 transition-colors" type="button">
            <Bookmark size={14} className="text-slate-400" /> Save to evidence
          </button>
          <button className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 px-4 text-xs font-bold text-red-700 transition-colors" type="button">
            <Trash2 size={14} /> Delete report
          </button>
        </div>

        {/* AI Disclaimer box */}
        <div className="p-4 rounded-xl border border-[#E7E7EA] bg-slate-50 text-[10px] text-slate-500 leading-normal flex items-start gap-2.5">
          <ShieldAlert size={14} className="text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> AI-generated weekly narrative insights are for general educational purposes. Check calculated numeric tables before making decisions.
          </span>
        </div>
      </Card>
    </AppShell>
  );
}
