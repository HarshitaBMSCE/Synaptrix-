import Link from "next/link";
import { Badge, Logo } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export async function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const user = await requireAdmin();
  
  return (
    <main className="min-h-screen bg-[#F7F7F8] text-[#202124]">
      {/* Admin header */}
      <header className="border-b border-[#E7E7EA] bg-white px-4 py-5 md:px-8 shadow-sm">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Logo />
            </Link>
            <span className="h-6 w-[1px] bg-slate-200" />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight md:text-2xl text-[#202124]">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="green">
              {user.isDemo ? "Demo Admin" : "Admin Workspace"}
            </Badge>
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
              Exit admin
            </Link>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mx-auto max-w-7xl mt-5">
          <AdminNav />
        </div>
      </header>

      {/* Main admin content */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {children}
      </section>
    </main>
  );
}
