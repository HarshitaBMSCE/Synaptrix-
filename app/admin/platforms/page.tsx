import { AdminShell } from "@/components/admin-shell";
import { Card, Badge } from "@/components/ui";
import { listAdminPlatforms } from "@/lib/admin";

export default async function AdminPlatformsPage() {
  const platforms = await listAdminPlatforms();

  return (
    <AdminShell title="Platform Management">
      <div className="mb-6">
        <p className="text-sm text-slate-500">Configure supported platforms, active categories, and benchmark status rules.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => {
          return (
            <Card key={platform.name} className="flex flex-col justify-between hover:shadow-sm transition-all duration-200">
              <div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
                  <h3 className="font-extrabold text-base text-[#202124]">{platform.name}</h3>
                  <Badge tone={platform.active ? "green" : "red"}>
                    {platform.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                <p className="font-bold text-sm text-[#202124] mt-0.5">{platform.category}</p>
                
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {platform.supportedJobTypes?.map((type) => (
                    <Badge key={type} tone="neutral">{type}</Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>Display Order: #{platform.displayOrder}</span>
                {platform.benchmarkAvailable && (
                  <span className="text-emerald-600">Benchmark Ready</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </AdminShell>
  );
}
