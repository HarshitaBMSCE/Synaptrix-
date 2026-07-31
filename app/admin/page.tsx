import { AdminShell } from "@/components/admin-shell";
import { Card, Badge } from "@/components/ui";
import { getAdminOverview } from "@/lib/admin";
import { Users, FileText, AlertTriangle, ShieldCheck, Activity } from "lucide-react";

export default async function AdminPage() {
  const data = await getAdminOverview();
  
  const metrics = [
    { label: "Total registered users", value: data.totalRegisteredUsers, icon: Users, tone: "neutral" as const },
    { label: "Active workers", value: data.activeWorkers, icon: Users, tone: "green" as const },
    { label: "Jobs logged", value: data.jobsLogged, icon: FileText, tone: "neutral" as const },
    { label: "Jobs flagged as underpaid", value: data.jobsFlaggedAsUnderpaid, icon: AlertTriangle, tone: "red" as const },
    { label: "Complaints generated", value: data.complaintsGenerated, icon: FileText, tone: "amber" as const },
    { label: "Pending incidents", value: data.pendingIncidentReports, icon: AlertTriangle, tone: "red" as const },
    { label: "Pending community moderation", value: data.pendingCommunitySubmissions, icon: ShieldCheck, tone: "amber" as const },
    { label: "Platform count", value: data.platformCount, icon: Activity, tone: "green" as const }
  ];

  return (
    <AdminShell title="Admin Overview">
      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
              <m.icon size={18} className="text-slate-400" />
              <Badge tone={m.tone}>{m.tone === "neutral" ? "Audit" : m.tone}</Badge>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{m.label}</p>
            <p className="mt-1 text-3xl font-black text-[#202124]">{m.value}</p>
          </Card>
        ))}
      </div>

      {/* Fairness & Activity columns */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Fairness Distribution card */}
        <Card className="space-y-4">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="font-bold text-base text-[#202124]">Fairness Distribution</h3>
            <p className="text-xs text-slate-400">Status of platform fairness verdicts across all user evaluations.</p>
          </div>
          
          <div className="space-y-2">
            {data.fairnessDistribution.map((item) => {
              const tone = item.bucket === "Fair" ? "green" : item.bucket === "Borderline" ? "amber" : "red";
              return (
                <div key={item.bucket} className="flex items-center justify-between rounded-xl border border-[#E7E7EA] bg-white p-4 text-xs font-bold text-[#202124]">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      tone === "green" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    <span>{item.bucket}</span>
                  </div>
                  <strong>{item.count} jobs</strong>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Admin Activity card */}
        <Card className="space-y-4">
          <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#202124]">Recent Admin Activity</h3>
              <p className="text-xs text-slate-400">Security audit log actions executed by admin actors.</p>
            </div>
            <Badge tone="neutral">V{data.benchmarkVersion}</Badge>
          </div>

          <div className="space-y-3">
            {data.recentAdminActivity.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-[#F7F7F8] p-4 text-xs font-semibold text-slate-600">
                <p className="font-bold text-[#202124] text-sm mb-1">{item.action}</p>
                <p className="text-slate-400">
                  Resource: {item.resourceType} • {new Date(item.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
