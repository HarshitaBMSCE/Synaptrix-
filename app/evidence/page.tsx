import { FileText, Image as ImageIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, EmptyState, ButtonLink } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { listEvidence } from "@/lib/repository";

export default async function EvidencePage() {
  const evidence = await listEvidence(await getCurrentUserId());

  return (
    <AppShell title="Evidence Vault" subtitle="Private S3 object keys, metadata, retention consent, and short-lived access links.">
      {/* Evidence checklist grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {evidence.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              title="Evidence vault is empty"
              body="Upload payout screenshots or log jobs with media attachments to start archiving evidence files securely in S3."
              action={<ButtonLink href="/jobs/scan">Scan screenshot evidence</ButtonLink>}
            />
          </div>
        ) : (
          evidence.map((asset) => (
            <Card key={asset.id} className="flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {asset.mimeType.startsWith("image/") ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </div>
                  <Badge tone={asset.retainedWithConsent ? "green" : "amber"}>
                    {asset.retainedWithConsent ? "Retention Consented" : "Temporary"}
                  </Badge>
                </div>
                
                <h3 className="font-extrabold text-sm text-[#202124] line-clamp-1">{asset.originalFileName}</h3>
                <p className="mt-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {asset.mimeType} • {(asset.size / 1024).toFixed(0)} KB
                </p>

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{asset.category}</Badge>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-50 pt-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">AWS S3 Object Key</p>
                <code className="block break-all rounded-lg bg-slate-50 p-2 text-[10px] text-slate-600 font-medium font-mono">
                  {asset.objectKey}
                </code>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
