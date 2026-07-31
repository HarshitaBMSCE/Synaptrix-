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
    <AppShell title="Jobs" subtitle="Manual, screenshot, and voice job records with worker-owned CSV export.">
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/jobs/new"><Plus className="mr-2" size={18} />Manual job</ButtonLink>
        <ButtonLink href="/jobs/scan" variant="secondary"><FileImage className="mr-2" size={18} />Scan screenshot</ButtonLink>
        <ButtonLink href="/jobs/voice" variant="secondary"><Mic className="mr-2" size={18} />Voice entry</ButtonLink>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(["id,platform,net,distance,minutes", ...jobs.map((job) => `${job.id},${job.platform},${job.netPayout},${job.platformDistanceKm},${job.activeMinutes}`)].join("\n"))}`}
          download="gigshield-jobs.csv"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-semibold"
        >
          <Download className="mr-2" size={18} />Export CSV
        </a>
      </div>
      <div className="mt-5 grid gap-4">
        {jobs.map((job) => {
          const evaluation = evaluations.find((item) => item.jobId === job.id);
          return (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="transition hover:bg-muted">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{job.platform} • {job.originArea} to {job.destinationArea}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(job.startedAt).toLocaleString("en-IN")} • {job.captureMethod} • {job.platformDistanceKm} km • {job.activeMinutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">₹{job.netPayout}</p>
                    <Badge tone={evaluation ? tone(evaluation.verdict) : "neutral"}>{evaluation?.verdict ?? "Not evaluated"}</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
