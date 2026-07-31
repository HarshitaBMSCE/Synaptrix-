import { AppShell } from "@/components/app-shell";
import { AssistantPanel } from "@/components/assistant-panel";
import { Card, Badge } from "@/components/ui";
import { rightsPack } from "@/lib/rights-pack";
import { Bot, ShieldAlert } from "lucide-react";

export default function AssistantPage() {
  return (
    <AppShell title="Rights & Pay Assistant" subtitle="Claude-ready assistant with deterministic tools and a curated India/Karnataka rights pack.">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        
        {/* Left Side: Assistant Panel (chat component) */}
        <Card className="flex flex-col h-[70vh] justify-between">
          <div className="border-b border-slate-50 pb-4 mb-4">
            <h3 className="font-bold text-base text-[#202124] flex items-center gap-2">
              <Bot size={18} className="text-primary" /> Pay & Rights Chat
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Ask about platform deductions, underpayments, or your legal rights.</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <AssistantPanel />
          </div>
        </Card>

        {/* Right Side: Curated Rights Snippets */}
        <div className="space-y-6">
          <Card className="max-h-[70vh] overflow-y-auto">
            <h3 className="font-bold text-base text-[#202124] border-b border-slate-50 pb-4 mb-4">Curated Rights Themes</h3>
            <div className="space-y-3">
              {rightsPack.slice(0, 6).map((entry) => (
                <div key={entry.theme} className="rounded-xl border border-slate-100 bg-[#F7F7F8] p-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="font-bold text-[#202124] text-sm">{entry.theme}</p>
                    <Badge tone="neutral">Legal Reference</Badge>
                  </div>
                  <p className="leading-relaxed font-medium">{entry.snippet}</p>
                </div>
              ))}
            </div>
            
            {/* Legal Disclaimer */}
            <div className="mt-6 p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-start gap-2">
              <ShieldAlert size={16} className="text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Legal Disclaimer:</strong> General information only — not official legal advice. The assistant parses platform policy context and cannot issue legal determinations.
              </div>
            </div>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
