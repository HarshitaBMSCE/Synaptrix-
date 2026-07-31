import { Bell } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { getCurrentUserId } from "@/lib/auth";
import { listNotifications } from "@/lib/repository";

export default async function NotificationsPage() {
  const notifications = await listNotifications(await getCurrentUserId());
  return (
    <AppShell title="Notifications" subtitle="In-app MongoDB notifications plus Web Push service worker and granular opt-in preferences.">
      <div className="grid gap-4">
        {notifications.map((notice) => (
          <Card key={notice.id}>
            <div className="flex items-start gap-3">
              <Bell className="text-primary" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">{notice.title}</h2>
                  <Badge tone={notice.sensitive ? "amber" : "neutral"}>{notice.sensitive ? "Sensitive hidden on lock screen" : "Non-sensitive"}</Badge>
                  {!notice.isRead ? <Badge tone="green">New</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{notice.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">Deep link: {notice.deepLink}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
