"use client";

import { useRouter } from "next/navigation";
import { ButtonLink, Card } from "@/components/ui";

export function DemoRoleSwitcher({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  function enter(role: "worker" | "admin") {
    document.cookie = `gigshield_demo_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    router.push(role === "admin" ? "/admin" : "/dashboard");
  }
  return (
    <Card className="w-full max-w-lg">
      <h1 className="text-2xl font-bold">GigShield demo roles</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Demo mode is isolated from production authorization and only appears when `DEMO_MODE=true`.
      </p>
      {enabled ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <button className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground" type="button" onClick={() => enter("worker")}>
            Enter as Worker
          </button>
          <button className="min-h-11 rounded-md border border-border bg-white px-4 font-semibold" type="button" onClick={() => enter("admin")}>
            Enter as Admin
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Demo mode is disabled in this environment.</p>
          <div className="mt-4"><ButtonLink href="/sign-in">Sign in</ButtonLink></div>
        </div>
      )}
    </Card>
  );
}
