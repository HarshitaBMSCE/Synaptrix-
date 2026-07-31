import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { JobForm } from "@/components/job-form";

export default function NewJobPage() {
  return (
    <AppShell title="Manual job entry" subtitle="Save a private job record and evaluate it with deterministic Bengaluru assumptions.">
      <Card>
        <JobForm captureMethod="manual" />
      </Card>
    </AppShell>
  );
}
