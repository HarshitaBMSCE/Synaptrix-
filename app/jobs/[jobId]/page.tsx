import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getEvaluation, getJob } from "@/lib/repository";

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const userId = await getCurrentUserId();
  const [job, evaluation] = await Promise.all([getJob(userId, jobId), getEvaluation(userId, jobId)]);
  if (!job || !evaluation) notFound();

  return (
    <AppShell title={`${job.platform} job`} subtitle={`${job.originArea} to ${job.destinationArea}`}>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Actual net payment</p>
              <p className="text-4xl font-black">₹{job.netPayout}</p>
            </div>
            <Badge tone={evaluation.finalFairnessScore >= 85 ? "green" : evaluation.finalFairnessScore >= 70 ? "amber" : "red"}>{evaluation.verdict}</Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <span>Expected net: ₹{evaluation.expectedNet}</span>
            <span>Gap: ₹{evaluation.estimatedGap}</span>
            <span>Final score: {evaluation.finalFairnessScore}/100</span>
            <span>Confidence: {evaluation.confidenceScore}/100</span>
            <span>Gross: ₹{job.grossPayout}</span>
            <span>Deductions: ₹{job.deductions}</span>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Component-score breakdown</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["Fare payment", evaluation.farePaymentScore],
              ["Deduction clarity", evaluation.deductionScore],
              ["Distance accuracy", evaluation.distanceAccuracyScore],
              ["Transparency", evaluation.transparencyScore]
            ].map(([label, score]) => (
              <div key={label as string}>
                <div className="flex justify-between text-sm font-medium"><span>{label}</span><span>{score}/100</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${score}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-5">
        <h2 className="text-lg font-bold">What changed this result?</h2>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
          {evaluation.explanationFactors.map((factor) => <p key={factor}>{factor}</p>)}
        </div>
        <h3 className="mt-5 font-bold">Assumptions</h3>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {Object.entries(evaluation.assumptions).map(([key, value]) => (
            <div key={key} className="rounded-md border border-border bg-white p-3 text-sm">
              <p className="text-muted-foreground">{key}</p>
              <p className="font-semibold">{String(value)}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
