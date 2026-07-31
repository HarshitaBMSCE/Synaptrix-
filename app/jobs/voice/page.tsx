import { Mic } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { VoiceEntry } from "@/components/voice-entry";

export default function VoiceJobPage() {
  return (
    <AppShell title="Voice entry" subtitle="Use browser speech where available, or type a transcript and review parsed fields before saving.">
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-primary-foreground">
            <Mic size={22} />
          </div>
          <div>
            <h2 className="font-bold">Example</h2>
            <p className="text-sm text-muted-foreground">“Swiggy delivery, 8.2 kilometres, 34 minutes, paid 112 rupees, 12 rupees deducted.”</p>
          </div>
        </div>
        <VoiceEntry />
      </Card>
    </AppShell>
  );
}
