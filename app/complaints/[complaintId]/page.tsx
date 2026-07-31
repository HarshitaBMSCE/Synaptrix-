import { notFound } from "next/navigation";
import { Copy, Download, Save, Share2, ArrowLeft, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { getComplaint } from "@/lib/repository";
import Link from "next/link";

export default async function ComplaintDetailPage({ params }: { params: Promise<{ complaintId: string }> }) {
  const { complaintId } = await params;
  const complaint = await getComplaint(await getCurrentUserId(), complaintId);
  if (!complaint) notFound();

  return (
    <AppShell title="Edit Complaint Draft" subtitle="Preview and edit before any copy, download, email, or share action.">
      {/* Return Link */}
      <div className="mb-4">
        <Link href="/complaints" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back to all drafts
        </Link>
      </div>

      <Card className="space-y-6">
        {/* Header information */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-50 pb-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{complaint.type.replace("-", " ")}</Badge>
              <Badge tone="amber">Not Sent</Badge>
            </div>
            <h2 className="text-2xl font-extrabold text-[#202124]">{complaint.subject}</h2>
            <p className="text-xs text-slate-500 font-semibold">Requested remedy: {complaint.requestedRemedy}</p>
          </div>
        </div>

        {/* Textarea editor */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">Complaint Body Editor</label>
          <textarea
            className="min-h-[380px] w-full rounded-2xl border border-[#E7E7EA] bg-[#F7F7F8] p-5 text-sm leading-relaxed text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            defaultValue={complaint.body}
          />
        </div>

        {/* Action Controls grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 pt-4 border-t border-slate-50">
          <button
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-[#D84315] text-sm font-bold text-white shadow-sm shadow-primary/10 transition-colors"
            type="button"
          >
            <Save size={16} /> Save draft
          </button>
          <button
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors"
            type="button"
          >
            <Copy size={16} /> Copy text
          </button>
          <button
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors"
            type="button"
          >
            <Download size={16} /> Download report
          </button>
          <button
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors"
            type="button"
          >
            <Share2 size={16} /> Share manually
          </button>
        </div>

        {/* Footer info box */}
        <div className="p-4 rounded-xl border border-[#E7E7EA] bg-slate-50 text-xs text-slate-500 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Guidelines:</strong> Unknown facts must remain as placeholders (bracketed text). GigShield serves to compile evidence and never automatically submits or mails complaints.
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
