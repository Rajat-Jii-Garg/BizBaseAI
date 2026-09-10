// @ts-expect-error Deno resolves npm dependencies at runtime.
import { createClient } from "npm:@supabase/supabase-js@2";

// @ts-expect-error web-push declaration is not available to Deno editor.
import webpush from "npm:web-push@3.6.7";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };

  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;

const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
  "mailto:bizbaseai@gmail.com",
  VAPID_PUBLIC,
  VAPID_PRIVATE,
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { notification_id } = await req.json();

    if (!notification_id) {
      throw new Error("notification_id is required");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, content, related_id")
      .eq("id", notification_id)
      .single();

    if (notificationError || !notification) {
      throw new Error("Notification not found");
    }

    /*
     * Default destination.
     */
    let url = "/notifications";

    /*
     * MESSAGE:
     * open exact conversation.
     */
    if (notification.type === "message" && notification.related_id) {
      url = `/messages?conversation=${encodeURIComponent(
        notification.related_id,
      )}`;
    }

    const { data: subscriptions, error: subscriptionError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .eq("user_id", notification.user_id);

    if (subscriptionError) {
      throw subscriptionError;
    }

    let sent = 0;

    for (const subscription of subscriptions || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,

            keys: {
              p256dh: subscription.p256dh,

              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: notification.title || "BizBase",

            body: notification.content || "",

            url,

            type: notification.type,

            conversation_id:
              notification.type === "message" ? notification.related_id : null,
          }),
        );

        sent++;
      } catch (error) {
        const pushError = error as {
          statusCode?: number;
        };

        /*
         * Browser subscription expired.
         * Remove it permanently.
         */
        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", subscription.id);
        } else {
          console.error("Push delivery failed:", error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        total: subscriptions?.length || 0,
      }),
      {
        status: 200,

        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("send-push error:", error);

    return new Response(
      JSON.stringify({
        success: false,

        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,

        headers: {
          ...corsHeaders,

          "Content-Type": "application/json",
        },
      },
    );
  }
});
