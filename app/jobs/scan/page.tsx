import { FileImage } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { JobForm } from "@/components/job-form";

export default function ScanJobPage() {
  return (
    <AppShell title="Screenshot scan" subtitle="Upload to private S3 when configured, then review Claude extraction before saving.">
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <FileImage className="text-primary" size={28} />
          <h2 className="mt-3 text-lg font-bold">Evidence upload</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Client-side validation accepts images up to 8 MB. The browser receives a presigned PUT URL; MongoDB stores object keys and metadata only.
          </p>
          <div className="mt-4 rounded-lg border border-dashed border-border bg-muted p-6 text-center text-sm">
            Demo screenshot selected: swiggy-rain-deduction.png
          </div>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <p>Low confidence: deduction reason, waiting fare visibility.</p>
            <p>No job is finalized until the worker confirms this review form.</p>
          </div>
        </Card>
        <Card>
          <JobForm
            captureMethod="screenshot"
            initialValues={{
              platform: "Swiggy",
              grossPayout: 118,
              deductions: 16,
              unexplainedDeductions: 12,
              platformDistanceKm: 8.2,
              routeDistanceKm: 9.1,
              activeMinutes: 34,
              waitingMinutes: 12,
              originArea: "Indiranagar",
              destinationArea: "Koramangala",
              weatherCondition: "rain"
            }}
          />
        </Card>
      </div>
    </AppShell>
  );
}
