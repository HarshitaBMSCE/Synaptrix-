import { notFound } from "next/navigation";
import { Copy, Download, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getComplaint } from "@/lib/repository";

export default async function ComplaintDetailPage({ params }: { params: Promise<{ complaintId: string }> }) {
  const { complaintId } = await params;
  const complaint = await getComplaint(await getCurrentUserId(), complaintId);
  if (!complaint) notFound();

  return (
    <AppShell title="Complaint draft" subtitle="Preview and edit before any copy, download, email, or share action.">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge>{complaint.type}</Badge>
            <h2 className="mt-3 text-2xl font-bold">{complaint.subject}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Requested remedy: {complaint.requestedRemedy}</p>
          </div>
          <Badge tone="amber">Not sent</Badge>
        </div>
        <textarea className="mt-5 min-h-[360px] w-full rounded-md border border-input bg-white p-4 text-sm leading-6" defaultValue={complaint.body} />
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          {[
            ["Save draft", Save],
            ["Copy text", Copy],
            ["Download report", Download],
            ["Share manually", Copy]
          ].map(([label, Icon]) => (
            <button key={label as string} className="min-h-11 rounded-md border border-border bg-white px-4 font-semibold" type="button">
              <Icon className="mr-2 inline" size={18} />{label as string}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Unknown facts must remain as placeholders. GigShield never automatically sends complaints.</p>
      </Card>
    </AppShell>
  );
}
