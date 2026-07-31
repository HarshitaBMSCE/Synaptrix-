import { PiggyBank, Calendar, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";

export default async function SavingsPage() {
  const summary = await getDashboardSummary(await getCurrentUserId(), "weekly");
  const goal = summary.savingsGoal;
  const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const recommendation = Math.min(Math.round(summary.net * (goal.safeSavingsPercentage / 100)), Math.max(0, goal.targetAmount - goal.currentAmount));

  return (
    <AppShell title="Savings Goal Tracker" subtitle="Manual savings tracking only. No bank movement occurs in this prototype.">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        
        {/* Left: Main Goal overview card */}
        <Card className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <PiggyBank size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#202124]">{goal.title}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Calendar size={12} /> Deadline: {new Date(goal.deadline).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
            <Badge tone="green">{progress}% complete</Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Goal progress</span>
              <span>₹{goal.currentAmount.toLocaleString("en-IN")} of ₹{goal.targetAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Current Saved Balance</span>
            <p className="text-4xl font-black text-[#202124] mt-1">₹{goal.currentAmount.toLocaleString("en-IN")}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <Badge tone="neutral">Period: {goal.period}</Badge>
            <Badge tone="neutral">Safe cap: {goal.safeSavingsPercentage}% of net earnings</Badge>
          </div>
        </Card>

        {/* Right: Recommendation & transfer card */}
        <div className="space-y-6">
          <Card className="flex flex-col justify-between h-full bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <TrendingUp size={18} className="text-primary" />
                <h3 className="font-bold text-sm text-[#202124]">Transfer Recommendation</h3>
              </div>
              
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Based on your logged net earnings this week and a safe savings cap of {goal.safeSavingsPercentage}%, we recommend transferring the following amount:
              </p>

              <div className="rounded-2xl border border-slate-100 bg-[#F7F7F8] p-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Deposit</span>
                <p className="text-3xl font-black text-primary mt-1">₹{recommendation}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Calculated from net payout inputs</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <button
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-[#D84315] text-sm font-bold text-white shadow-sm shadow-primary/10 transition-all duration-200"
                type="button"
              >
                Confirm manual transfer
              </button>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  This tracker is for logging purposes. It does not initiate any transfers or connect to real bank accounts.
                </span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
