import { PiggyBank } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";

export default async function SavingsPage() {
  const summary = await getDashboardSummary(await getCurrentUserId(), "weekly");
  const goal = summary.savingsGoal;
  const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
  const recommendation = Math.min(Math.round(summary.net * (goal.safeSavingsPercentage / 100)), Math.max(0, goal.targetAmount - goal.currentAmount));
  return (
    <AppShell title="Savings" subtitle="Manual savings tracking only. No bank movement occurs in this prototype.">
      <Card>
        <PiggyBank className="text-primary" size={28} />
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">{goal.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Deadline {new Date(goal.deadline).toLocaleDateString("en-IN")} • safe cap {goal.safeSavingsPercentage}% of net earnings</p>
          </div>
          <Badge tone="green">{progress}% complete</Badge>
        </div>
        <div className="mt-5 h-4 rounded-full bg-muted"><div className="h-4 rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
        <p className="mt-4 text-4xl font-black">₹{goal.currentAmount.toLocaleString("en-IN")} / ₹{goal.targetAmount.toLocaleString("en-IN")}</p>
        <div className="mt-5 rounded-lg border border-border bg-white p-4">
          <p className="text-sm text-muted-foreground">Recommended manual transfer after today</p>
          <p className="text-3xl font-black">₹{recommendation}</p>
        </div>
        <button className="mt-5 min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground" type="button">Confirm manual transfer</button>
      </Card>
    </AppShell>
  );
}
