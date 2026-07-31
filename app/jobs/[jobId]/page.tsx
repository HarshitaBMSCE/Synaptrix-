import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getEvaluation, getJob } from "@/lib/repository";
import { AlertCircle, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const userId = await getCurrentUserId();
  const [job, evaluation] = await Promise.all([getJob(userId, jobId), getEvaluation(userId, jobId)]);
  if (!job || !evaluation) notFound();

  const score = evaluation.finalFairnessScore;
  const tone = score >= 85 ? "green" : score >= 70 ? "amber" : "red";

  return (
    <AppShell title={`${job.platform} Job Detail`} subtitle={`${job.originArea} to ${job.destinationArea}`}>
      {/* Return Link */}
      <div className="mb-4">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back to all jobs
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Left: Financial Overview Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 border-b border-slate-50 pb-4 mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Actual Net Payment</p>
                <p className="text-4xl font-black text-[#202124] mt-1">₹{job.netPayout.toFixed(2)}</p>
              </div>
              <Badge tone={tone}>{evaluation.verdict}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-400">Expected net payout</p>
                <p className="text-base font-bold text-[#202124] mt-0.5">{money(evaluation.expectedNet)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-400">Estimated payout gap</p>
                <p className={`text-base font-bold mt-0.5 ${evaluation.estimatedGap > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {evaluation.estimatedGap > 0 ? money(evaluation.estimatedGap) : "₹0"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-400">Fairness score</p>
                <p className="text-base font-bold text-[#202124] mt-0.5">{score}/100</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-400">Confidence level</p>
                <p className="text-base font-bold text-[#202124] mt-0.5">{evaluation.confidenceScore}%</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-50 pt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
            <span>Gross payout: ₹{job.grossPayout}</span>
            <span>Deductions: ₹{job.deductions}</span>
          </div>
        </Card>

        {/* Right: Component Score Card */}
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-4">
            <HelpCircle size={18} className="text-primary" />
            <h3 className="font-bold text-base text-[#202124]">Component-score breakdown</h3>
          </div>
          <div className="space-y-4">
            {[
              ["Fare payment criteria", evaluation.farePaymentScore],
              ["Deduction clarity", evaluation.deductionScore],
              ["Distance accuracy", evaluation.distanceAccuracyScore],
              ["Transparency", evaluation.transparencyScore]
            ].map(([label, s]) => (
              <div key={label as string} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#202124]">
                  <span>{label as string}</span>
                  <span>{s}/100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${s}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Factors and Assumptions Panel */}
      <Card className="mt-6">
        <h3 className="font-bold text-base text-[#202124] border-b border-slate-50 pb-3 mb-3">What affected this result?</h3>
        <div className="space-y-2 text-sm text-slate-600">
          {evaluation.explanationFactors.length > 0 ? (
            evaluation.explanationFactors.map((factor) => (
              <div key={factor} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl">
                <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No major anomalies detected for this job.</p>
          )}
        </div>

        <h4 className="font-bold text-sm text-[#202124] mt-6 mb-3">Baseline Assumptions used</h4>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {Object.entries(evaluation.assumptions).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-[#E7E7EA] bg-[#F7F7F8] p-4 text-xs font-semibold text-slate-600">
              <p className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">{key.replace(/([A-Z])/g, " $1")}</p>
              <p className="font-bold text-[#202124] text-sm mt-1">{String(value)}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Complaint Prompt */}
        {evaluation.estimatedGap > 0 && (
          <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-[#F4511E]/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#202124]">Underpayment gap detected</p>
              <p className="text-xs text-slate-500 mt-0.5">You can automatically draft an underpayment complaint for this job.</p>
            </div>
            <Link href="/complaints" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-sm shadow-primary/10 hover:bg-[#D84315] transition-all">
              Draft complaint
            </Link>
          </div>
        )}
      </Card>

      {/* Disclaimers Footer card */}
      <div className="mt-6 p-4 rounded-xl border border-[#E7E7EA] bg-slate-100/50 text-xs text-slate-500 space-y-1">
        <p><strong>Calculations Disclaimer:</strong> This is an independent estimate based on inputs provided and pilot guidelines.</p>
        <p>It is not an official platform fare calculation or official legal determination. Review all extracted details before relying on the results.</p>
      </div>
    </AppShell>
  );
}
