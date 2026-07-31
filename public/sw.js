self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : { title: "GigShield", body: "You have a new update." };
  event.waitUntil(
    self.registration.showNotification(payload.title || "GigShield", {
      body: payload.body || "Open GigShield for details.",
      data: { url: payload.deepLink || "/notifications" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/notifications"));
});
