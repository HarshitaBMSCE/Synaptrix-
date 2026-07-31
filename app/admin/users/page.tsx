import { AdminShell } from "@/components/admin-shell";
import { Card, Badge } from "@/components/ui";
import { listAdminUsers } from "@/lib/admin";

export default async function AdminUsersPage() {
  const users = await listAdminUsers();

  return (
    <AdminShell title="User Management">
      <Card>
        <div className="border-b border-slate-50 pb-4 mb-4">
          <h3 className="font-bold text-base text-[#202124]">Registered Accounts Directory</h3>
          <p className="text-xs text-slate-400">View and audit all worker profiles and administration credentials.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs leading-normal">
            <thead>
              <tr className="border-b border-[#E7E7EA] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Worker Type</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Platforms Used</th>
                <th className="py-3 px-4">Onboarding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#202124]">{user.displayName ?? user.id}</td>
                  <td className="py-4 px-4">
                    <Badge tone={user.role === "admin" ? "green" : "neutral"}>
                      {user.role ?? "worker"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 capitalize">{user.workerType?.replace("-", " ") ?? "—"}</td>
                  <td className="py-4 px-4">{user.city ?? "—"}</td>
                  <td className="py-4 px-4">
                    <span className="text-[10px] font-mono leading-none">
                      {Array.isArray(user.platformsUsed) && user.platformsUsed.length > 0 ? user.platformsUsed.join(", ") : "—"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge tone={user.onboardingCompleted ? "green" : "amber"}>
                      {user.onboardingCompleted ? "Complete" : "Pending"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge tone={user.status === "active" ? "green" : "red"}>
                      {user.status ?? "active"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
