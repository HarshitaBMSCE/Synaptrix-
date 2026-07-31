"use client";

import { useState } from "react";
import { JobForm } from "@/components/job-form";
import { inputClass } from "@/components/ui";
import type { JobInput } from "@/lib/validations";

export function VoiceEntry() {
  const [transcript, setTranscript] = useState("Swiggy delivery, 8.2 kilometres, 34 minutes, paid 112 rupees, 12 rupees deducted.");
  const [parsed, setParsed] = useState<Partial<JobInput> | null>(null);
  const [message, setMessage] = useState("");

  async function parse() {
    const response = await fetch("/api/jobs/voice", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ transcript })
    });
    const payload = await response.json();
    if (payload.ok) {
      setParsed(payload.data);
      setMessage("Transcript parsed. Review the fields before saving.");
    } else {
      setMessage(payload.error?.message ?? "Could not parse transcript.");
    }
  }

  return (
    <div className="grid gap-4">
      <textarea className={`${inputClass} min-h-28`} value={transcript} onChange={(event) => setTranscript(event.target.value)} />
      <button onClick={parse} className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground" type="button">
        Parse transcript
      </button>
      {message ? <p className="rounded-md border border-border bg-muted p-3 text-sm">{message}</p> : null}
      {parsed ? <JobForm captureMethod="voice" initialValues={parsed} /> : null}
    </div>
  );
}
