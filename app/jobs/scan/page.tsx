import { FileImage, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { ScreenshotUploader } from "@/components/screenshot-uploader";

export default function ScanJobPage() {
  return (
    <AppShell title="Screenshot Scan Upload" subtitle="Upload to private S3 when configured, then review Claude extraction before saving.">
      <Card className="mb-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileImage size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#202124]">Evidence upload</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Choose, capture, or drag in a payout screenshot. The job is not saved until you review and confirm the extracted fields.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <ShieldAlert size={14} className="text-primary" />
              <span>PNG, JPEG, WEBP, and HEIC are accepted up to 10 MB.</span>
            </div>
          </div>
        </div>
      </Card>
      <ScreenshotUploader />
    </AppShell>
  );
}
