"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/platforms", label: "Platforms" },
  { href: "/admin/benchmarks", label: "Benchmarks" },
  { href: "/admin/community", label: "Community" },
  { href: "/admin/incidents", label: "Incidents" },
  { href: "/admin/rights", label: "Rights" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/audit-logs", label: "Audit logs" }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 overflow-auto pb-1 scrollbar-none">
      {adminNav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 border ${
              active
                ? "bg-[#F4511E]/10 text-primary border-primary/20"
                : "border-[#E7E7EA] bg-white text-slate-600 hover:bg-slate-50 hover:text-[#202124]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
