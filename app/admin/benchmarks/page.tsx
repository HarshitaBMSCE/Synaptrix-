import { AdminShell } from "@/components/admin-shell";
import { Card, Badge } from "@/components/ui";
import { listAdminBenchmarks } from "@/lib/admin";
import { Info, Settings } from "lucide-react";

export default async function AdminBenchmarksPage() {
  const benchmarks = await listAdminBenchmarks();

  return (
    <AdminShell title="Benchmark Configurations">
      {/* Disclaimer Notes Card */}
      <Card className="border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Info size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#202124]">Independent Baseline Assumptions</h3>
            <p className="text-xs text-slate-400">Values represent pilot calculations, not official transport platform rates.</p>
          </div>
        </div>
        <p className="text-xs font-semibold leading-relaxed text-slate-500 mt-3 border-t border-slate-50 pt-3">
          Previous fairness evaluations are frozen with the version tag of the configuration active at their creation.
        </p>
      </Card>

      <div className="mt-6 space-y-6">
        {benchmarks.map((benchmark) => (
          <Card key={benchmark.version} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-primary" />
                <h3 className="font-black text-[#202124] text-base">{benchmark.version}</h3>
              </div>
              <Badge tone="green">Active baseline</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {Object.entries(benchmark)
                .filter(([, value]) => typeof value === "number" || typeof value === "string")
                .slice(0, 12)
                .map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-[#E7E7EA] bg-[#F7F7F8] p-4 text-xs font-semibold text-slate-600">
                    <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="font-bold text-[#202124] text-sm mt-1">{String(value)}</p>
                  </div>
                ))}
            </div>
            
            {benchmark.notes && (
              <div className="text-xs text-slate-400 mt-2 italic">
                * Note: {benchmark.notes}
              </div>
            )}
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
