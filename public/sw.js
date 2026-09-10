self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "BizBase";
  const body = data.body || "";
  const url = data.url || "/notifications";

  event.waitUntil(
    (async () => {
      /*
       * If user is already focused on the
       * exact conversation, don't show
       * a duplicate OS notification.
       */
      const clientsList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const targetUrl = new URL(url, self.location.origin);

      const activeChatOpen = clientsList.some((client) => {
        try {
          const clientUrl = new URL(client.url);

          return (
            client.focused &&
            clientUrl.pathname === targetUrl.pathname &&
            clientUrl.search === targetUrl.search
          );
        } catch {
          return false;
        }
      });

      if (activeChatOpen) {
        return;
      }

      await self.registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",

        tag: data.conversation_id
          ? `bizbase-conversation-${data.conversation_id}`
          : "bizbase-notification",

        renotify: true,

        data: {
          url,
        },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/notifications";

  event.waitUntil(
    (async () => {
      const targetUrl = new URL(url, self.location.origin);

      const clientsList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      /*
       * Reuse existing BizBase tab.
       */
      for (const client of clientsList) {
        try {
          const clientUrl = new URL(client.url);

          if (clientUrl.origin === targetUrl.origin) {
            await client.navigate(targetUrl.href);

            await client.focus();

            return;
          }
        } catch {
          // Continue to next client.
        }
      }

      /*
       * No existing tab.
       */
      await clients.openWindow(targetUrl.href);
    })(),
  );
});
