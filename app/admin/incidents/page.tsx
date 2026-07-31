import { AdminShell } from "@/components/admin-shell";
import { EmptyState } from "@/components/ui";
import { listAdminIncidents } from "@/lib/admin";

export default async function AdminIncidentsPage() {
  const items = await listAdminIncidents();
  
  return (
    <AdminShell title="Incident Moderation">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Moderating user incident reports for general information visibility.</p>
      </div>

      <div className="max-w-3xl">
        {items.length === 0 ? (
          <EmptyState
            title="No reported incidents"
            body="Worker-submitted location incidents and hazard reviews will appear here for visibility check."
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
