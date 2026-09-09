// @ts-expect-error Deno resolves npm dependencies at runtime, but the editor may not resolve this specifier.
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-expect-error Deno resolves npm dependencies at runtime, but web-push lacks declarations for this specifier.
import webpush from "npm:web-push@3.6.7";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails("mailto:support@bizbase-ai.vercel.app", VAPID_PUBLIC, VAPID_PRIVATE);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { notification_id } = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: notif } = await supabase
      .from("notifications")
      .select("user_id, title, content")
      .eq("id", notification_id)
      .single();
    if (!notif) throw new Error("Notification not found");

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", notif.user_id);

    for (const sub of subs || []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: notif.title, body: notif.content, url: "/notifications" })
        );
      } catch (err: unknown) {
        const pushError = err as { statusCode?: number };
        if (pushError.statusCode === 410 || pushError.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    return new Response(JSON.stringify({ sent: (subs || []).length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("send-push error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});