"use client";

import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2, Save, FileText, Map, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/ui";
import { jobInputSchema, type JobInput } from "@/lib/validations";

const defaults: JobInput = {
  platform: "Swiggy",
  jobType: "delivery",
  captureMethod: "manual",
  grossPayout: 0,
  baseFare: 0,
  incentives: 0,
  tips: 0,
  deductions: 0,
  unexplainedDeductions: 0,
  platformDistanceKm: 0,
  routeDistanceKm: 0,
  pickupDistanceKm: 0,
  activeMinutes: 0,
  waitingMinutes: 0,
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  originArea: "",
  destinationArea: "",
  tolls: 0,
  parking: 0,
  weatherCondition: "rain",
  nightJob: false,
  notes: "",
  evidenceAssetIds: [],
  visibleComponents: {
    baseFareVisible: true,
    distanceFareVisible: true,
    waitingFareVisible: false,
    incentiveVisible: true,
    deductionReasonVisible: false,
    taxVisible: false
  },
  extractionConfidence: 100
};

export function JobForm({ captureMethod = "manual", initialValues }: { captureMethod?: JobInput["captureMethod"]; initialValues?: Partial<JobInput> }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const form = useForm<JobInput>({
    resolver: zodResolver(jobInputSchema) as Resolver<JobInput>,
    defaultValues: { ...defaults, ...initialValues, captureMethod }
  });
  const gross = form.watch("grossPayout") || 0;
  const tips = form.watch("tips") || 0;
  const incentives = form.watch("incentives") || 0;
  const deductions = form.watch("deductions") || 0;
  const net = gross + tips + incentives - deductions;

  async function onSubmit(values: JobInput) {
    if (status === "saving") return;
    setStatus("saving");
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = await response.json();
    if (!payload.ok) {
      setStatus("error");
      setMessage(payload.error?.message ?? "Could not save job");
      return;
    }
    setStatus("saved");
    setMessage(`Saved ${payload.data.job.platform} job. Fairness verdict: ${payload.data.evaluation.verdict}`);
    router.push(`/jobs/${payload.data.job.id}`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Platform & General Info Section */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-[#202124]">Platform & Job Type</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Platform">
            <select className={inputClass} {...form.register("platform")}>
              {["Swiggy", "Zomato", "Blinkit", "Uber", "Ola", "Rapido"].map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </Field>
          <Field label="Job type">
            <select className={inputClass} {...form.register("jobType")}>
              <option value="delivery">Delivery</option>
              <option value="ride">Ride</option>
              <option value="courier">Courier</option>
              <option value="service">Home service</option>
            </select>
          </Field>
          <Field label="Date and time">
            <input className={inputClass} type="datetime-local" {...form.register("startedAt")} />
          </Field>
        </div>
      </div>

      {/* Payout Details Section */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-[#202124]">Financial Breakdown (₹)</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            ["grossPayout", "Gross payout"],
            ["baseFare", "Base fare"],
            ["incentives", "Incentives"],
            ["tips", "Tips"],
            ["deductions", "Deductions"],
            ["unexplainedDeductions", "Unexplained deductions"],
            ["tolls", "Tolls"],
            ["parking", "Parking"]
          ].map(([name, label]) => (
            <Field key={name} label={label}>
              <input className={inputClass} type="number" step="0.01" {...form.register(name as keyof JobInput)} />
            </Field>
          ))}
        </div>
      </div>

      {/* Route & Environment Section */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Map size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-[#202124]">Distance & Duration</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          {[
            ["platformDistanceKm", "Platform distance km"],
            ["routeDistanceKm", "Route distance km"],
            ["pickupDistanceKm", "Pickup distance km"],
            ["activeMinutes", "Active minutes"],
            ["waitingMinutes", "Waiting minutes"]
          ].map(([name, label]) => (
            <Field key={name} label={label}>
              <input className={inputClass} type="number" step="0.1" {...form.register(name as keyof JobInput)} />
            </Field>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <Field label="Weather Condition">
            <select className={inputClass} {...form.register("weatherCondition")}>
              <option value="clear">Clear</option>
              <option value="rain">Rain</option>
              <option value="heavy-rain">Heavy rain</option>
            </select>
          </Field>
          <div className="flex flex-col justify-end">
            <label className="flex h-12 items-center gap-2.5 rounded-xl border border-input bg-white px-4 text-sm font-semibold cursor-pointer select-none">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" {...form.register("nightJob")} />
              Night job
            </label>
          </div>
        </div>
      </div>

      {/* Origin & Destination area */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Map size={18} className="text-primary" />
          <h3 className="font-bold text-sm text-[#202124]">Origin & Destination Areas</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Origin area" hint="e.g. Indiranagar Sector 3">
            <input className={inputClass} placeholder="Enter origin area" {...form.register("originArea")} />
          </Field>
          <Field label="Destination area" hint="e.g. Koramangala block 4">
            <input className={inputClass} placeholder="Enter destination area" {...form.register("destinationArea")} />
          </Field>
        </div>
      </div>

      <Field label="Worker Notes">
        <textarea className={`${inputClass} min-h-24 w-full`} placeholder="Add any details, platform dispute ticket numbers, or issues encountered..." {...form.register("notes")} />
      </Field>

      {/* Bottom Sticky-style Bar with Calculated Outcome */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E7E7EA] bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Calculated Net Payout</p>
          <p className="text-3xl font-black text-[#202124] mt-1">₹{Math.max(0, net).toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={status === "saving"}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#E7E7EA] bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            <Save size={16} /> Save draft
          </button>
          <button
            type="submit"
            disabled={status === "saving"}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm shadow-primary/10 hover:bg-[#D84315] disabled:opacity-60 transition-colors"
          >
            <CheckCircle2 size={16} /> {status === "saving" ? "Saving..." : "Save & Evaluate"}
          </button>
        </div>
      </div>

      {message ? (
        <div className={`flex items-start gap-2.5 rounded-xl border p-4 text-sm font-semibold leading-relaxed ${status === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>{message}</div>
        </div>
      ) : null}
    </form>
  );
}
