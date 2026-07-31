import { Mic, Info } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { VoiceEntry } from "@/components/voice-entry";
import { getCurrentUserId } from "@/lib/auth";
import { getProfile } from "@/lib/repository";

function speechLanguage(language: string) {
  if (language === "hi") return "hi-IN";
  if (language === "kn") return "kn-IN";
  return "en-IN";
}

export default async function VoiceJobPage() {
  let initialLanguage: "en-IN" | "hi-IN" | "kn-IN" = "en-IN";
  try {
    const profile = await getProfile(await getCurrentUserId());
    initialLanguage = speechLanguage(profile.preferredLanguage);
  } catch {
    initialLanguage = "en-IN";
  }

  return (
    <AppShell title="Voice Transcript Entry" subtitle="Speak a transcript where supported, or type details to parse fields before saving.">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left Side: Guidelines & Examples */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Mic size={20} />
              </div>
              <h3 className="font-bold text-base text-[#202124]">Voice input guide</h3>
            </div>
            
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Speak or write a concise description of your platform job. The backend extracts numeric facts to fill your job reviewer form.
            </p>

            <div className="rounded-xl border border-slate-100 bg-[#F7F7F8] p-4 text-xs font-semibold text-slate-600 space-y-2">
              <p className="text-slate-400 uppercase tracking-wide text-[9px] font-bold flex items-center gap-1">
                <Info size={12} className="text-primary" /> Format Example
              </p>
              <p className="italic text-[#202124] text-sm">
                “Swiggy delivery, 8.2 kilometres, 34 minutes, paid 112 rupees, 12 rupees deducted.”
              </p>
            </div>

            <div className="mt-6 text-xs text-slate-400 space-y-1">
              <p>• Supported languages: English, Hindi, and Kannada.</p>
              <p>• Extracted values are approximate and require your confirmation.</p>
            </div>
          </Card>
        </div>

        {/* Right Side: The Voice recorder and parsed form */}
        <Card>
          <div className="border-b border-slate-50 pb-4 mb-6">
            <h3 className="font-bold text-base text-[#202124]">Voice / Typed Transcript</h3>
            <p className="text-xs text-slate-400 mt-0.5">Parse your spoken transcript into structured fields below.</p>
          </div>
          <VoiceEntry initialLanguage={initialLanguage} />
        </Card>
      </div>
    </AppShell>
  );
}
