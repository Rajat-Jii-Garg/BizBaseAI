// Auto-generates professional posts from seeded Indian demo users to keep
// the BizBase feed feeling active. Triggered by pg_cron (every few hours).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TOPICS = [
  "a hard lesson from your work this week",
  "a small win you had today",
  "a tip you wish you knew earlier in your career",
  "your honest take on remote vs office work in India",
  "an underrated tool or resource you love",
  "a mistake freshers usually make and how to avoid it",
  "thoughts on networking that actually works",
  "what you are learning right now and why",
  "a hot take about your industry",
  "a productivity habit that genuinely helped you",
  "advice for someone switching into your field",
  "something you wish more recruiters / clients understood",
];

async function generatePost(profile: any, topic: string): Promise<string> {
  const prompt = `You are ${profile.full_name}, a ${profile.profession} based in ${profile.location}, India.
About you: ${profile.bio}
Current role: ${profile.current_position} at ${profile.company_name}.
Skills: ${(profile.skills || []).join(", ")}.

Write ONE short, authentic, professional social post (like a tweet / mini-LinkedIn post) about: ${topic}.

Strict rules:
- 1 to 4 short sentences, max ~360 characters total.
- First person, conversational, no fluff, no clichés like "excited to share".
- Sound like a real Indian professional, mild Indian English is fine.
- You MAY add 0-3 relevant hashtags at the end (no #BizBase, no spam).
- Do NOT wrap in quotes. Do NOT add emojis on every line (max 1 emoji, optional).
- Output ONLY the post text. Nothing else.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.95, maxOutputTokens: 220 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Empty Gemini response");
  return text.replace(/^["']|["']$/g, "").slice(0, 1000);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    let count = 4;
    try {
      const body = await req.json();
      if (typeof body?.count === "number") count = Math.min(Math.max(body.count, 1), 10);
    } catch (_) { /* no body */ }

    const { data: bots, error: botErr } = await supabase
      .from("profiles")
      .select("id, full_name, profession, location, bio, current_position, company_name, skills")
      .eq("is_seed_bot", true);
    if (botErr) throw botErr;
    if (!bots || bots.length === 0) {
      return new Response(JSON.stringify({ ok: true, created: 0, note: "no seed bots" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Shuffle & pick `count` distinct bots
    const shuffled = [...bots].sort(() => Math.random() - 0.5).slice(0, count);

    const results: any[] = [];
    for (const bot of shuffled) {
      try {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const content = await generatePost(bot, topic);
        const { data: post, error: postErr } = await supabase
          .from("posts")
          .insert({ user_id: bot.id, content })
          .select("id")
          .single();
        if (postErr) throw postErr;
        await supabase.from("seed_post_logs").insert({ user_id: bot.id, post_id: post.id });
        results.push({ user: bot.full_name, post_id: post.id, ok: true });
      } catch (e: any) {
        results.push({ user: bot.full_name, ok: false, error: e.message });
      }
    }

    return new Response(JSON.stringify({ ok: true, created: results.filter(r => r.ok).length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("seed-auto-posts error", e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
