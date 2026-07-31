import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";

export default async function CommunityPage() {
  const summary = await getDashboardSummary(await getCurrentUserId(), "weekly");
  return (
    <AppShell title="Community benchmarks" subtitle="Anonymous normalized records with no names, phone numbers, screenshots, exact addresses, or free-text notes.">
      <div className="grid gap-4 md:grid-cols-3">
        {summary.community.map((item) => (
          <Card key={item.jobId}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold">{item.platform}</h2>
              <Badge tone={(item.sampleSize ?? 0) >= 5 ? "green" : "amber"}>{item.sampleSize} samples</Badge>
            </div>
            <p className="mt-4 text-3xl font-black">₹{item.median ?? "—"}</p>
            <p className="mt-1 text-sm text-muted-foreground">Median payout. IQR: ₹{item.q1 ?? "—"} to ₹{item.q3 ?? "—"}</p>
            <p className="mt-3 text-xs text-muted-foreground">Most recent: {item.recency ? new Date(item.recency).toLocaleDateString("en-IN") : "Not enough data"}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <h2 className="font-bold">Contribution consent</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Authenticated workers can opt into anonymized contribution. GigShield buckets zone, distance, duration, time band, payout, and deduction amount only.
        </p>
      </Card>
    </AppShell>
  );
}
