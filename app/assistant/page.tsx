import { AppShell } from "@/components/app-shell";
import { AssistantPanel } from "@/components/assistant-panel";
import { Card } from "@/components/ui";
import { rightsPack } from "@/lib/rights-pack";

export default function AssistantPage() {
  return (
    <AppShell title="Rights and pay assistant" subtitle="Claude-ready assistant with deterministic tools and a curated India/Karnataka rights pack.">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <AssistantPanel />
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Curated rights themes</h2>
          <div className="mt-4 grid gap-3">
            {rightsPack.slice(0, 6).map((entry) => (
              <div key={entry.theme} className="rounded-md border border-border bg-white p-3">
                <p className="font-semibold">{entry.theme}</p>
                <p className="mt-1 text-sm text-muted-foreground">{entry.snippet}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">General information only, not legal advice. The assistant never invents platform policy.</p>
        </Card>
      </div>
    </AppShell>
  );
}
