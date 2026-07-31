import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { listComplaints } from "@/lib/repository";

export default async function ComplaintsPage() {
  const complaints = await listComplaints(await getCurrentUserId());
  return (
    <AppShell title="Complaints" subtitle="Evidence-based drafts. Workers edit, preview, copy, or share manually.">
      <div className="mb-4">
        <ButtonLink href="/complaints/complaint-1">Open seeded draft</ButtonLink>
      </div>
      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <Link key={complaint.id} href={`/complaints/${complaint.id}`}>
            <Card className="hover:bg-muted">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{complaint.subject}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{complaint.type} • {complaint.tone} • {complaint.jobIds.length} job records</p>
                </div>
                <Badge>{complaint.status}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
