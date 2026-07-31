import Link from "next/link";
import { Bell, Bot, FileText, Home, Map, PiggyBank, ReceiptText, Route, Settings, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/jobs", label: "Jobs", icon: ReceiptText },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/routes", label: "Routes", icon: Route },
  { href: "/complaints", label: "Complaints", icon: FileText },
  { href: "/evidence", label: "Evidence", icon: ShieldCheck },
  { href: "/community", label: "Community", icon: Users },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/insights", label: "Insights", icon: Map },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-border bg-white px-4 py-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck size={21} />
          </div>
          <div>
            <div className="font-bold">GigShield</div>
            <div className="text-xs text-muted-foreground">Bengaluru pilot</div>
          </div>
        </Link>
        <div className="mt-4">
          <Badge tone="green">Demo mode ready</Badge>
        </div>
        <nav className="mt-6 grid gap-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-muted">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="absolute bottom-5 left-4 right-4 text-xs leading-5 text-muted-foreground">
          Fairness estimates are independent benchmarks. Rights content is general information, not legal advice.
        </p>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-normal">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            <Link href="/demo" className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold">
              Demo
            </Link>
          </div>
        </header>
        <div className="px-4 pb-28 pt-5 md:px-8 lg:pb-8">{children}</div>
      </main>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-white px-2 py-2 lg:hidden">
        {nav.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href} className="grid justify-items-center gap-1 rounded-md px-1 py-2 text-[11px] font-medium text-slate-700">
            <item.icon size={19} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
