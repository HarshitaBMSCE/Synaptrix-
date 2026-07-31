import Link from "next/link";
import { Download, FileImage, Mic, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { listEvaluations, listJobs } from "@/lib/repository";

function tone(verdict: string) {
  if (verdict === "Fair") return "green" as const;
  if (verdict === "Slightly underpaid") return "amber" as const;
  return "red" as const;
}

export default async function JobsPage() {
  const userId = await getCurrentUserId();
  const [jobs, evaluations] = await Promise.all([listJobs(userId), listEvaluations(userId)]);

  return (
    <AppShell title="Logged Jobs" subtitle="Manual, screenshot, and voice job records with worker-owned CSV export.">
      {/* Top Action Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E7EA] pb-6 mb-6">
        <div className="flex flex-wrap gap-2.5">
          <ButtonLink href="/jobs/new">
            <Plus className="mr-1.5" size={16} /> Manual job
          </ButtonLink>
          <ButtonLink href="/jobs/scan" variant="secondary">
            <FileImage className="mr-1.5" size={16} /> Scan screenshot
          </ButtonLink>
          <ButtonLink href="/jobs/voice" variant="secondary">
            <Mic className="mr-1.5" size={16} /> Voice entry
          </ButtonLink>
        </div>

        {jobs.length > 0 && (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(["id,platform,net,distance,minutes", ...jobs.map((job) => `${job.id},${job.platform},${job.netPayout},${job.platformDistanceKm},${job.activeMinutes}`)].join("\n"))}`}
            download="gigshield-jobs.csv"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#E7E7EA] bg-white px-5 text-sm font-semibold text-[#202124] hover:bg-slate-50 transition-colors"
          >
            <Download className="mr-1.5" size={16} /> Export CSV
          </a>
        )}
      </div>

      {/* Jobs List Grid */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card className="text-center py-12">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <ReceiptText className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-[#202124]">No job records logged</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
              Log your delivery or ride details to check whether platform payouts were fair.
            </p>
            <div className="mt-6">
              <ButtonLink href="/jobs/new">
                Log your first job
              </ButtonLink>
            </div>
          </Card>
        ) : (
          jobs.map((job) => {
            const evaluation = evaluations.find((item) => item.jobId === job.id);
            return (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                <Card className="hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-extrabold text-[#202124]">{job.platform}</h4>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase bg-slate-100 rounded-md px-2 py-0.5 tracking-wider">
                          {job.captureMethod}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {job.originArea || "Unknown Origin"} to {job.destinationArea || "Unknown Destination"}
                      </p>
                      <p className="mt-1.5 text-xs font-semibold text-slate-400">
                        {new Date(job.startedAt).toLocaleString("en-IN")} • {job.platformDistanceKm} km • {job.activeMinutes} min
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <p className="text-2xl font-black text-[#202124]">₹{job.netPayout}</p>
                      <Badge tone={evaluation ? tone(evaluation.verdict) : "neutral"}>
                        {evaluation?.verdict ?? "Not evaluated"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

import { ReceiptText } from "lucide-react";
