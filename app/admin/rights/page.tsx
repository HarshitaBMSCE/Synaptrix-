import { AdminShell } from "@/components/admin-shell";
import { EmptyState } from "@/components/ui";
import { listAdminRights } from "@/lib/admin";

export default async function AdminRightsPage() {
  const items = await listAdminRights();
  
  return (
    <AdminShell title="Rights Content Manager">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Managing custom legal rights snippets, act references, and multilingual translations.</p>
      </div>

      <div className="max-w-3xl">
        {items.length === 0 ? (
          <EmptyState
            title="No custom rights snippets"
            body="Curated India and Karnataka gig worker rights packs are currently populated by standard values. Manage custom additions here."
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
