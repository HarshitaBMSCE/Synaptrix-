import { AdminShell } from "@/components/admin-shell";
import { Card, Badge } from "@/components/ui";
import { listAdminAuditLogs } from "@/lib/admin";
import { ShieldCheck, Calendar, Activity } from "lucide-react";

export default async function AdminAuditLogsPage() {
  const logs = await listAdminAuditLogs();

  return (
    <AdminShell title="Security Audit Logs">
      <div className="mb-6">
        <p className="text-sm text-slate-500">View and inspect the chronological trail of admin actor actions and resource configurations.</p>
      </div>

      <div className="space-y-4 max-w-4xl">
        {logs.length === 0 ? (
          <Card className="text-center py-12 text-slate-400">
            <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No administrative audit records logged yet.</p>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
                  <ShieldCheck size={20} className="text-slate-500" />
                </div>
                
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-2 mb-1.5">
                    <span className="font-extrabold text-sm text-[#202124]">{log.action}</span>
                    <Badge tone={log.actorRole === "admin" ? "green" : "neutral"}>
                      {log.actorRole}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2 sm:grid-cols-2 text-xs font-semibold text-slate-500 leading-normal">
                    <div>
                      <span className="text-slate-400">Actor Clerk ID:</span>
                      <span className="ml-1 text-slate-700 font-mono text-[11px]">{log.actorClerkUserId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Resource:</span>
                      <span className="ml-1 text-slate-700">{log.resourceType}</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 pt-1.5">
                    <Calendar size={12} /> {new Date(log.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminShell>
  );
}
