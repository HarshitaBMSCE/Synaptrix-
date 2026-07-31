import { clsx, type ClassValue } from "clsx";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-border bg-white p-6 shadow-[0_2px_12px_rgba(20,20,20,0.03)]", className)} {...props} />;
}

export function Badge({ tone = "neutral", children, className }: { tone?: "green" | "amber" | "red" | "neutral"; children: React.ReactNode; className?: string }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-100"
  };
  return <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase", tones[tone], className)}>{children}</span>;
}

export function ButtonLink({ href, children, variant = "primary", className }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary"; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-[#D84315] shadow-sm shadow-primary/10"
          : "border border-border bg-white hover:bg-slate-50 text-slate-800",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-[#202124]">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "min-h-12 rounded-xl border border-input bg-white px-4 py-2.5 text-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-ring/20";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white/70 p-8 text-center shadow-[0_2px_12px_rgba(20,20,20,0.02)]">
      <h3 className="text-base font-bold text-[#202124]">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5.5 w-5.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      </div>
      <div className="text-left">
        <span className="text-lg font-black tracking-tight text-[#202124]">Gig<span className="text-primary">Shield</span></span>
        <div className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase leading-none mt-0.5">Bengaluru Pilot</div>
      </div>
    </div>
  );
}
