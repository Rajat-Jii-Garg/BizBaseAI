import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const ICON: Record<string, string> = {
  like: "❤️", comment: "💬", share: "🔁", repost: "🔁",
  connection: "🤝", follow: "➕", message: "✉️",
  event: "📅", job_application: "💼", community: "👥",
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return { skipped: true };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "BizBase <notifications@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Resend error:", res.status, t);
    return { error: t };
  }
  return { ok: true };
}

function buildHtml(fullName: string, notifs: any[]) {
  const items = notifs.slice(0, 10).map(n => `
    <tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
      <div style="font-size:20px;display:inline-block;width:30px;">${ICON[n.type] || "🔔"}</div>
      <strong style="color:#1e293b;">${n.title}</strong>
      ${n.content ? `<div style="color:#475569;font-size:13px;margin-left:30px;">${n.content}</div>` : ""}
    </td></tr>`).join("");
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8fafc;">
    <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
      <h1 style="color:#3b82f6;margin:0 0 4px;">BizBase</h1>
      <h2 style="color:#1e293b;margin:0 0 16px;font-size:18px;">Hi ${fullName || "there"}, you've got ${notifs.length} new ${notifs.length === 1 ? "update" : "updates"}!</h2>
      <table style="width:100%;border-collapse:collapse;">${items}</table>
      <div style="text-align:center;margin-top:24px;">
        <a href="https://bizbase-ai.vercel.app/notifications" style="background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View all on BizBase</a>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:20px;">Manage email preferences in Settings → Notifications.</p>
    </div>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Find users with unread notifications in last 24h
    const { data: notifs, error } = await supabase
      .from("notifications")
      .select("id,user_id,type,title,content,created_at")
      .gte("created_at", since)
      .eq("read", false)
      .limit(2000);
    if (error) throw error;

    const byUser = new Map<string, any[]>();
    for (const n of notifs || []) {
      if (!byUser.has(n.user_id)) byUser.set(n.user_id, []);
      byUser.get(n.user_id)!.push(n);
    }

    const userIds = Array.from(byUser.keys());
    if (userIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No notifications" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,email,full_name,notification_preferences,is_seed_bot")
      .in("id", userIds);

    // Find users already emailed in last 20h to avoid spam
    const cutoff = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
    const { data: recentLogs } = await supabase
      .from("notification_email_log")
      .select("user_id")
      .gte("sent_at", cutoff)
      .in("user_id", userIds);
    const recent = new Set((recentLogs || []).map(l => l.user_id));

    let sent = 0;
    for (const p of profiles || []) {
      if (!p.email || p.is_seed_bot) continue;
      if (recent.has(p.id)) continue;
      const prefs = (p.notification_preferences || {}) as Record<string, boolean>;
      if (prefs.emailNotifications === false) continue;
      const list = byUser.get(p.id) || [];
      if (list.length === 0) continue;
      const html = buildHtml(p.full_name || "", list);
      const subject = `🔔 ${list.length} new ${list.length === 1 ? "update" : "updates"} on BizBase`;
      const r = await sendEmail(p.email, subject, html);
      if (r.ok || r.skipped) {
        await supabase.from("notification_email_log").insert({
          user_id: p.id,
          notification_count: list.length,
        });
        sent++;
      }
    }

    return new Response(JSON.stringify({ sent, total_users: userIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("digest error:", e);
    return new Response(JSON.stringify({ error: e?.message || "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
