"use client";

import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { Field, inputClass } from "@/components/ui";
import { jobInputSchema, type JobInput } from "@/lib/validations";

const defaults: JobInput = {
  platform: "Swiggy",
  jobType: "delivery",
  captureMethod: "manual",
  grossPayout: 112,
  baseFare: 25,
  incentives: 0,
  tips: 0,
  deductions: 12,
  unexplainedDeductions: 12,
  platformDistanceKm: 8.2,
  routeDistanceKm: 9.1,
  pickupDistanceKm: 1.4,
  activeMinutes: 34,
  waitingMinutes: 12,
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  originArea: "Indiranagar",
  destinationArea: "Koramangala",
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
  extractionConfidence: 90
};

export function JobForm({ captureMethod = "manual", initialValues }: { captureMethod?: JobInput["captureMethod"]; initialValues?: Partial<JobInput> }) {
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
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
      <div className="grid gap-4 md:grid-cols-4">
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
      <div className="grid gap-4 md:grid-cols-4">
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
        <Field label="Weather">
          <select className={inputClass} {...form.register("weatherCondition")}>
            <option value="clear">Clear</option>
            <option value="rain">Rain</option>
            <option value="heavy-rain">Heavy rain</option>
          </select>
        </Field>
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium">
          <input type="checkbox" {...form.register("nightJob")} />
          Night job
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Origin area">
          <input className={inputClass} {...form.register("originArea")} />
        </Field>
        <Field label="Destination area">
          <input className={inputClass} {...form.register("destinationArea")} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea className={`${inputClass} min-h-28`} {...form.register("notes")} />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4">
        <div>
          <p className="text-sm text-muted-foreground">Calculated net payout</p>
          <p className="text-2xl font-bold">₹{Math.max(0, net).toFixed(0)}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold">
            <Save size={18} /> Save draft
          </button>
          <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <CheckCircle2 size={18} /> Save and evaluate
          </button>
        </div>
      </div>
      {message ? (
        <div className={`rounded-md border p-3 text-sm ${status === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          {message}
        </div>
      ) : null}
    </form>
  );
}
