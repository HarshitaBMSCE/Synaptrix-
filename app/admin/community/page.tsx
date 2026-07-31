import { AdminShell } from "@/components/admin-shell";
import { EmptyState } from "@/components/ui";
import { listAdminCommunity } from "@/lib/admin";

export default async function AdminCommunityPage() {
  const items = await listAdminCommunity();
  
  return (
    <AdminShell title="Community Moderation">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Moderating submitted anonymous benchmark records before blending into overall trends.</p>
      </div>

      <div className="max-w-3xl">
        {items.length === 0 ? (
          <EmptyState
            title="No pending community records"
            body="Anonymized contributions records will appear here for security and moderation review before publishing."
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={JSON.stringify(item)} className="p-4 bg-white border border-[#E7E7EA] rounded-xl">
                {JSON.stringify(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
