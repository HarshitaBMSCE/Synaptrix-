"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Bot, FileText, Home, Map, PiggyBank, ReceiptText, Route, Settings, ShieldCheck, Users, Menu, X, Plus } from "lucide-react";
import { Logo } from "@/components/ui";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/jobs", label: "Jobs", icon: ReceiptText },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/routes", label: "Safety", icon: Route }
];

const secondaryNav = [
  { href: "/complaints", label: "Complaints", icon: FileText },
  { href: "/evidence", label: "Evidence", icon: ShieldCheck },
  { href: "/community", label: "Community", icon: Users },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/insights", label: "Insights", icon: Map },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#202124]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-[#E7E7EA] bg-white px-4 py-6 lg:block z-30">
        <Link href="/dashboard" className="block px-2">
          <Logo />
        </Link>
        
        {/* Navigation list */}
        <nav className="mt-8 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Core Tools</p>
          {primaryNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#F4511E]/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#202124]"
                }`}
              >
                <item.icon size={18} className={active ? "text-primary" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}

          <p className="px-3 pt-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Services & Safety</p>
          {secondaryNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#F4511E]/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#202124]"
                }`}
              >
                <item.icon size={18} className={active ? "text-primary" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 p-4 rounded-xl border border-[#E7E7EA] bg-slate-50/50">
          <p className="text-[10px] leading-relaxed text-slate-500">
            <strong>Disclaimer:</strong> Fairness estimates are independent benchmarks. Rights content is general information, not legal advice.
          </p>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="lg:pl-64 min-h-screen flex flex-col">
        {/* Desktop Header */}
        <header className="sticky top-0 z-20 border-b border-[#E7E7EA] bg-white/95 backdrop-blur-md px-6 py-4 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#202124] md:text-2xl">{title}</h1>
              {subtitle ? <p className="mt-0.5 text-xs text-slate-500 font-semibold">{subtitle}</p> : null}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/jobs/new"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/10 hover:bg-[#D84315] transition-all"
              >
                <Plus size={16} className="mr-1.5" /> Add job
              </Link>
            </div>
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 px-4 pb-28 pt-6 md:px-8 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-[#E7E7EA] bg-white px-2 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] lg:hidden">
        {primaryNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`grid justify-items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${
                active ? "text-primary" : "text-slate-500"
              }`}
            >
              <item.icon size={20} className={active ? "text-primary" : "text-slate-400"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`grid justify-items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${
            mobileMenuOpen ? "text-primary" : "text-slate-500"
          }`}
          type="button"
        >
          {mobileMenuOpen ? <X size={20} className="text-primary" /> : <Menu size={20} className="text-slate-400" />}
          <span>{mobileMenuOpen ? "Close" : "More"}</span>
        </button>
      </nav>

      {/* Mobile "More" Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute bottom-20 left-4 right-4 rounded-2xl bg-white p-4 border border-[#E7E7EA] shadow-xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Additional Services</p>
            <div className="grid grid-cols-2 gap-1">
              {secondaryNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                      active ? "bg-[#F4511E]/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon size={16} className={active ? "text-primary" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
