// Profile AI Coach — analyzes user profiles weekly and emails improvement tips
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import nodemailer from "npm:nodemailer@6.9.14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GMAIL_USER = Deno.env.get("GMAIL_USER")!;
const GMAIL_PASS = Deno.env.get("GMAIL_PASS")!;
const SITE_URL = "https://bizbase-ai.vercel.app";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

async function analyzeProfile(profile: any) {
  const ctx = {
    full_name: profile.full_name,
    bio: profile.bio,
    current_position: profile.current_position,
    company_name: profile.company_name,
    industry: profile.industry,
    location: profile.location,
    website: profile.website,
    skills: profile.skills,
    avatar: !!profile.avatar_url,
    banner: !!profile.banner_url,
    completion_score: profile.profile_completion_score,
  };

  const prompt = `Analyze this BizBase user's profile and return STRICT JSON only.
Profile: ${JSON.stringify(ctx)}

Return JSON shape:
{
  "score": <0-100 strength score>,
  "headline": "<one short motivational headline addressed to user>",
  "summary": "<2-3 sentence summary of profile state>",
  "suggestions": [
    {"title": "<short>", "why": "<why it matters>", "action": "<concrete one-liner action>"},
    ... (3 to 5 items)
  ]
}
Focus on missing/weak fields, bio quality, skills, professional positioning, and networking opportunities.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a professional profile coach. Respond ONLY with valid JSON, no markdown fences." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);
  const data = await res.json();
  let txt = data.choices[0].message.content.trim();
  txt = txt.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();
  return JSON.parse(txt);
}

function buildEmailHtml(name: string, analysis: any) {
  const sugg = analysis.suggestions.map((s: any, i: number) => `
    <div style="background:#f8fafc;border-left:4px solid #3b82f6;padding:16px 20px;margin:12px 0;border-radius:8px;">
      <div style="font-weight:700;color:#0f172a;font-size:15px;margin-bottom:6px;">${i + 1}. ${s.title}</div>
      <div style="color:#475569;font-size:14px;margin-bottom:8px;"><b>Why:</b> ${s.why}</div>
      <div style="color:#1e293b;font-size:14px;"><b>Action:</b> ${s.action}</div>
    </div>`).join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);padding:32px;border-radius:16px 16px 0 0;color:white;">
      <div style="font-size:13px;opacity:.9;letter-spacing:1px;font-weight:600;">BIZBASE AI COACH</div>
      <h1 style="margin:8px 0 4px;font-size:26px;">Hi ${name || "there"} 👋</h1>
      <div style="opacity:.95;font-size:15px;">${analysis.headline}</div>
      <div style="margin-top:18px;background:rgba(255,255,255,.18);padding:10px 14px;border-radius:10px;display:inline-block;">
        <span style="font-size:12px;opacity:.9;">Profile Strength</span>
        <span style="font-size:22px;font-weight:800;margin-left:8px;">${analysis.score}/100</span>
      </div>
    </div>
    <div style="background:white;padding:28px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,.06);">
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 18px;">${analysis.summary}</p>
      <h2 style="color:#0f172a;font-size:18px;margin:20px 0 10px;">This week's improvements</h2>
      ${sugg}
      <div style="text-align:center;margin:28px 0 8px;">
        <a href="${SITE_URL}/settings" style="background:#3b82f6;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;display:inline-block;">Update My Profile</a>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;">
        You're receiving this because AI Coach Emails are enabled.<br/>
        <a href="${SITE_URL}/settings" style="color:#64748b;">Manage preferences</a> · BizBase AI
      </p>
    </div>
  </div></body></html>`;
}

async function processUser(profile: any) {
  if (!profile.email) return { skipped: "no email" };
  const analysis = await analyzeProfile(profile);
  const html = buildEmailHtml(profile.full_name || "", analysis);

  await transporter.sendMail({
    from: `"BizBase AI Coach" <${GMAIL_USER}>`,
    to: profile.email,
    subject: `${profile.full_name?.split(" ")[0] || "Your"} profile insights — ${analysis.score}/100`,
    html,
  });

  await supabase.from("profiles").update({ last_ai_coach_email_at: new Date().toISOString() }).eq("id", profile.id);
  await supabase.from("ai_coach_email_logs").insert({
    user_id: profile.id,
    profile_score: analysis.score,
    suggestions: analysis,
    email_status: "sent",
  });

  return { sent: profile.email, score: analysis.score };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const singleUserId = body.user_id;
    const force = body.force === true;

    let query = supabase
      .from("profiles")
      .select("id,email,full_name,bio,current_position,company_name,industry,location,website,skills,avatar_url,banner_url,profile_completion_score,last_ai_coach_email_at,ai_coach_emails_enabled")
      .eq("ai_coach_emails_enabled", true)
      .not("email", "is", null);

    if (singleUserId) {
      query = query.eq("id", singleUserId);
    } else if (!force) {
      const cutoff = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
      query = query.or(`last_ai_coach_email_at.is.null,last_ai_coach_email_at.lt.${cutoff}`);
    }

    const { data: profiles, error } = await query.limit(50);
    if (error) throw error;

    const results: any[] = [];
    for (const p of profiles || []) {
      try {
        const r = await processUser(p);
        results.push({ user: p.id, ...r });
      } catch (e) {
        console.error("user failed", p.id, e);
        await supabase.from("ai_coach_email_logs").insert({
          user_id: p.id, email_status: "failed", error_message: String(e),
        });
        results.push({ user: p.id, error: String(e) });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
