"use client";

import { useEffect, useRef, useState } from "react";
import { FileImage, RefreshCcw, Trash2, UploadCloud } from "lucide-react";
import { JobForm } from "@/components/job-form";
import { Badge, inputClass } from "@/components/ui";
import { supportedScreenshotMimeTypes, validateScreenshotFile } from "@/lib/upload-validation";
import type { JobInput } from "@/lib/validations";

function uploadToS3(url: string, file: File, headers: Record<string, string>, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    xhr.timeout = 30000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed with status ${xhr.status}. Check S3 CORS and bucket permissions.`)));
    xhr.onerror = () => reject(new Error("Upload failed. This may be an S3 CORS or network error."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please retry with a smaller image or better network."));
    xhr.send(file);
  });
}

export function ScreenshotUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "presigning" | "uploading" | "processing" | "success">("idle");
  const [progress, setProgress] = useState(0);
  const [jobInput, setJobInput] = useState<Partial<JobInput> | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [label, setLabel] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function setSelected(nextFile: File | null) {
    setError("");
    setJobInput(null);
    setWarnings([]);
    setConfidence({});
    setLabel("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!nextFile) {
      setFile(null);
      setPreviewUrl("");
      return;
    }
    const validation = validateScreenshotFile(nextFile);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  async function analyse() {
    if (!file || submitting.current) return;
    submitting.current = true;
    setError("");
    setProgress(0);
    try {
      setStatus("presigning");
      const presignResponse = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, size: file.size, category: "screenshot" })
      });
      const presign = await presignResponse.json();
      if (!presign.ok) throw new Error(presign.error?.message ?? "Could not get upload permission.");

      if (presign.data.mode === "s3") {
        setStatus("uploading");
        await uploadToS3(presign.data.uploadUrl, file, presign.data.headers ?? {}, setProgress);
      } else {
        setProgress(100);
      }

      setStatus("processing");
      const completeResponse = await fetch("/api/uploads/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: presign.data.mode,
          objectKey: presign.data.objectKey,
          originalFileName: file.name,
          mimeType: file.type,
          size: file.size,
          category: "screenshot",
          retainedWithConsent: true
        })
      });
      const complete = await completeResponse.json();
      if (!complete.ok) throw new Error(complete.error?.message ?? "Screenshot extraction failed.");
      setLabel(complete.data.label);
      setWarnings(complete.data.extraction.warnings ?? []);
      setConfidence(complete.data.extraction.fieldConfidence ?? {});
      setJobInput(complete.data.jobInput);
      setStatus("success");
    } catch (caught) {
      setStatus("idle");
      setError(caught instanceof Error ? caught.message : "Screenshot upload failed.");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <div>
        <div
          className="rounded-lg border border-dashed border-border bg-muted p-6 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setSelected(event.dataTransfer.files[0] ?? null);
          }}
        >
          <FileImage className="mx-auto text-primary" size={32} />
          <h2 className="mt-3 font-bold">Upload payout screenshot</h2>
          <p className="mt-2 text-sm text-muted-foreground">Drag and drop, select, or capture a PNG, JPEG, WEBP, or HEIC image up to 10 MB.</p>
          <input
            className={`${inputClass} mt-4 w-full`}
            type="file"
            accept={supportedScreenshotMimeTypes.join(",")}
            capture="environment"
            onChange={(event) => setSelected(event.target.files?.[0] ?? null)}
            aria-label="Upload screenshot"
          />
        </div>

        {previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Screenshot preview" className="max-h-96 w-full object-contain" />
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={!file || status !== "idle"} onClick={analyse} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60">
            <UploadCloud size={18} /> Analyse screenshot
          </button>
          <button type="button" onClick={() => setSelected(null)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-white px-4 font-semibold">
            <Trash2 size={18} /> Remove
          </button>
          <button type="button" onClick={analyse} disabled={!file || status === "uploading" || status === "processing"} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-white px-4 font-semibold disabled:opacity-60">
            <RefreshCcw size={18} /> Retry
          </button>
        </div>

        {status !== "idle" ? (
          <div className="mt-4 rounded-lg border border-border bg-white p-4 text-sm">
            <p className="font-semibold">{status === "presigning" ? "Preparing upload..." : status === "uploading" ? `Uploading ${progress}%` : status === "processing" ? "Processing screenshot..." : "Extraction ready"}</p>
            <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${status === "uploading" ? progress : status === "success" ? 100 : 40}%` }} /></div>
          </div>
        ) : null}
        {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div> : null}
      </div>

      <div className="grid gap-4">
        {label ? <Badge tone={label.includes("Demo") ? "amber" : "green"}>{label}</Badge> : null}
        {warnings.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-bold">Review warnings</p>
            <ul className="mt-2 list-disc pl-5">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          </div>
        ) : null}
        {Object.keys(confidence).length > 0 ? (
          <div className="grid gap-2 rounded-lg border border-border bg-white p-4 text-sm md:grid-cols-2">
            {Object.entries(confidence).map(([field, score]) => (
              <div key={field} className={score < 75 ? "text-amber-800" : "text-slate-700"}>{field}: {score}% confidence</div>
            ))}
          </div>
        ) : null}
        {jobInput ? <JobForm captureMethod="screenshot" initialValues={jobInput} /> : null}
      </div>
    </div>
  );
}
