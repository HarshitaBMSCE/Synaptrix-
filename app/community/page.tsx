import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";
import { Users, Info } from "lucide-react";

export default async function CommunityPage() {
  const summary = await getDashboardSummary(await getCurrentUserId(), "weekly");

  return (
    <AppShell title="Community Benchmarks" subtitle="Anonymous normalized records with no names, phone numbers, screenshots, or exact coordinates.">
      {/* Benchmark stats cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {summary.community.map((item) => (
          <Card key={item.jobId} className="flex flex-col justify-between hover:shadow-sm transition-all duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
                <h3 className="font-extrabold text-base text-[#202124]">{item.platform}</h3>
                <Badge tone={(item.sampleSize ?? 0) >= 5 ? "green" : "amber"}>
                  {item.sampleSize} samples
                </Badge>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Median Payout</span>
              <p className="text-3xl font-black text-[#202124]">₹{item.median ?? "—"}</p>
              <p className="mt-1 text-xs text-slate-500 font-semibold leading-normal">
                Interquartile Range (IQR): ₹{item.q1 ?? "—"} to ₹{item.q3 ?? "—"}
              </p>
            </div>
            
            <div className="mt-6 border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400">
              <span>Bengaluru Pilot Zone</span>
              <span>
                Recent: {item.recency ? new Date(item.recency).toLocaleDateString("en-IN") : "Not enough data"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Contribution consent instructions */}
      <Card className="mt-6 border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-50">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#202124]">Anonymized Contribution Consent</h3>
            <p className="text-xs text-slate-400">Opt-in configurations are managed in your worker profile settings.</p>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 leading-relaxed">
          GigShield compiles collective benchmark metrics by bucketing platforms, general zones, distance brackets, duration brackets, and time bands. No names, phone numbers, payout screenshots, exact address labels, or worker notes are ever shared, protecting your absolute privacy.
        </p>

        <div className="mt-4 p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-start gap-2">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">
            Collective benchmarks help you understand if platforms are paying you in line with your local peers. Opting in helps strengthen this database.
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
