import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card, EmptyState } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { listComplaints } from "@/lib/repository";
import { Plus } from "lucide-react";

export default async function ComplaintsPage() {
  const complaints = await listComplaints(await getCurrentUserId());

  return (
    <AppShell title="Complaint Drafts" subtitle="Evidence-based drafts. Workers edit, preview, copy, or share manually.">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E7EA] pb-6 mb-6">
        <div>
          <p className="text-sm text-slate-500">Draft formal dispute letters based on your logged job details.</p>
        </div>
        <ButtonLink href="/jobs">
          <Plus className="mr-1.5" size={16} /> New from job record
        </ButtonLink>
      </div>

      {/* Complaints list */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <EmptyState
            title="No complaint drafts generated"
            body="Review a logged job from your jobs directory and use the complaint action to automatically pre-fill a formal dispute letter."
            action={<ButtonLink href="/jobs">Browse job history</ButtonLink>}
          />
        ) : (
          complaints.map((complaint) => (
            <Link key={complaint.id} href={`/complaints/${complaint.id}`} className="block">
              <Card className="hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone="neutral">{complaint.type.replace("-", " ")}</Badge>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-400 capitalize">
                        {complaint.tone} tone
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#202124] mt-2">{complaint.subject}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Contains {complaint.jobIds.length} linked job record{complaint.jobIds.length > 1 ? "s" : ""} • Created on {new Date(complaint.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  
                  <div className="text-right flex items-center gap-3">
                    <Badge tone="amber">{complaint.status}</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
