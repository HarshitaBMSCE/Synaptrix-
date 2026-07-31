import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { listEvidence } from "@/lib/repository";

export default async function EvidencePage() {
  const evidence = await listEvidence(await getCurrentUserId());
  return (
    <AppShell title="Evidence vault" subtitle="Private S3 object keys, metadata, retention consent, and short-lived access links.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {evidence.map((asset) => (
          <Card key={asset.id}>
            <ShieldCheck className="text-primary" />
            <h2 className="mt-3 font-bold">{asset.originalFileName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{asset.mimeType} • {(asset.size / 1024).toFixed(0)} KB</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{asset.category}</Badge>
              <Badge tone={asset.retainedWithConsent ? "green" : "amber"}>{asset.retainedWithConsent ? "Retention consented" : "Temporary only"}</Badge>
            </div>
            <p className="mt-3 break-all text-xs text-muted-foreground">{asset.objectKey}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
