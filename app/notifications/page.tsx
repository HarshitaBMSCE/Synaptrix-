import { Bell, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, EmptyState } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { listNotifications } from "@/lib/repository";
import Link from "next/link";

export default async function NotificationsPage() {
  const notifications = await listNotifications(await getCurrentUserId());

  return (
    <AppShell title="Alert Notifications" subtitle="In-app MongoDB notifications plus Web Push service worker and granular opt-in preferences.">
      <div className="space-y-4 max-w-4xl">
        {notifications.length === 0 ? (
          <EmptyState
            title="All caught up!"
            body="You have no new notifications or alerts at this moment."
          />
        ) : (
          notifications.map((notice) => (
            <Card key={notice.id} className="hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notice.isRead ? "bg-slate-100 text-slate-400" : "bg-[#F4511E]/10 text-primary"
                }`}>
                  <Bell size={20} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-extrabold text-sm text-[#202124]">{notice.title}</h4>
                    <Badge tone={notice.sensitive ? "amber" : "neutral"}>
                      {notice.sensitive ? "Sensitive (Hidden on Lockscreen)" : "Public"}
                    </Badge>
                    {!notice.isRead && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed">{notice.body}</p>
                  
                  {notice.deepLink && (
                    <div className="pt-2">
                      <Link href={notice.deepLink} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                        Navigate to alert details <ExternalLink size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
