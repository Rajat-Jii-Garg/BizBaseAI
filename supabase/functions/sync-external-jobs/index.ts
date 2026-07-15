// Fetches ONLY India-located jobs from public job APIs and upserts into public.jobs.
// Also auto-closes jobs whose application_deadline has passed.
// Invoked by pg_cron every 6 hours.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type JobRow = {
  source: string;
  external_id: string;
  external_url: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  work_mode: string;
  experience_level: string;
  industry: string;
  description: string;
  skills_required: string[] | null;
  is_active: boolean;
};

const stripHtml = (html: string) =>
  (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const mapJobType = (t: string): string => {
  const s = (t || "").toLowerCase();
  if (s.includes("part")) return "part-time";
  if (s.includes("contract")) return "contract";
  if (s.includes("intern")) return "internship";
  if (s.includes("free")) return "freelance";
  return "full-time";
};

// STRICT India-only check. Location must reference India or an Indian city/state.
const INDIA_REGEX = /(india|bharat|bangalore|bengaluru|mumbai|delhi\b|new delhi|gurgaon|gurugram|noida|hyderabad|chennai|pune|kolkata|ahmedabad|jaipur|kochi|cochin|indore|chandigarh|lucknow|nagpur|coimbatore|trivandrum|thiruvananthapuram|mysore|mysuru|vadodara|surat|bhubaneswar|visakhapatnam|vizag|goa|kerala|gujarat|maharashtra|karnataka|tamil nadu|telangana|punjab|haryana|rajasthan|uttar pradesh|west bengal|odisha)/i;

const isIndia = (location: string): boolean => {
  if (!location) return false;
  return INDIA_REGEX.test(location);
};

async function fetchRemotive(): Promise<JobRow[]> {
  const res = await fetch("https://remotive.com/api/remote-jobs?limit=200");
  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`);
  const data = await res.json();
  const jobs = (data.jobs || []) as any[];
  return jobs
    .filter((j) => isIndia(j.candidate_required_location || ""))
    .map((j) => ({
      source: "remotive",
      external_id: String(j.id),
      external_url: j.url,
      title: j.title?.slice(0, 200) || "Untitled",
      company_name: j.company_name || "Unknown",
      location: j.candidate_required_location || "India",
      job_type: mapJobType(j.job_type),
      work_mode: "remote",
      experience_level: "mid-level",
      industry: j.category || "Technology",
      description: stripHtml(j.description || "").slice(0, 4000),
      skills_required: Array.isArray(j.tags) ? j.tags.slice(0, 10) : null,
      is_active: true,
    }));
}

async function fetchRemoteOK(): Promise<JobRow[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": "BizBase Job Sync (support@bizbase-ai.com)" },
  });
  if (!res.ok) throw new Error(`RemoteOK HTTP ${res.status}`);
  const data = await res.json();
  const jobs = (Array.isArray(data) ? data : []).slice(1) as any[];
  return jobs
    .filter((j) => isIndia(j.location || ""))
    .slice(0, 80)
    .map((j) => ({
      source: "remoteok",
      external_id: String(j.id || j.slug),
      external_url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
      title: (j.position || "Untitled").slice(0, 200),
      company_name: j.company || "Unknown",
      location: j.location || "India",
      job_type: "full-time",
      work_mode: "remote",
      experience_level: "mid-level",
      industry: Array.isArray(j.tags) && j.tags.length ? j.tags[0] : "Technology",
      description: stripHtml(j.description || "").slice(0, 4000),
      skills_required: Array.isArray(j.tags) ? j.tags.slice(0, 10) : null,
      is_active: true,
    }));
}

// Jooble — India feed (free public API, no key required for basic queries via their partner endpoint is limited).
// We use their public search endpoint that doesn't require a key by returning JSON via query URL is not supported;
// so we rely on Remotive + RemoteOK which reliably tag India locations.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Auto-close jobs whose deadline passed
  try {
    await supabase
      .from("jobs")
      .update({ is_active: false })
      .lt("application_deadline", new Date().toISOString())
      .eq("is_active", true);
  } catch (e) {
    console.error("Auto-close failed", e);
  }

  const summary: Record<string, unknown> = {};
  const sources: Array<{ name: string; fn: () => Promise<JobRow[]> }> = [
    { name: "remotive", fn: fetchRemotive },
    { name: "remoteok", fn: fetchRemoteOK },
  ];

  let totalInserted = 0;
  for (const src of sources) {
    try {
      const rows = await src.fn();
      if (rows.length === 0) {
        summary[src.name] = { fetched: 0, inserted: 0 };
        continue;
      }
      const ids = rows.map((r) => r.external_id);
      const { data: existing, error: selErr } = await supabase
        .from("jobs")
        .select("external_id")
        .eq("source", src.name)
        .in("external_id", ids);
      if (selErr) throw selErr;
      const existingSet = new Set((existing || []).map((r: any) => r.external_id));
      const newRows = rows.filter((r) => !existingSet.has(r.external_id));
      if (newRows.length === 0) {
        summary[src.name] = { fetched: rows.length, inserted: 0, skipped: rows.length };
        continue;
      }
      const { error: insErr, count } = await supabase
        .from("jobs")
        .insert(newRows, { count: "exact" });
      if (insErr) throw insErr;
      summary[src.name] = { fetched: rows.length, inserted: count ?? newRows.length, skipped: rows.length - newRows.length };
      totalInserted += count ?? newRows.length;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[${src.name}] sync failed`, msg);
      summary[src.name] = { error: msg };
    }
  }

  return new Response(
    JSON.stringify({ success: true, total: totalInserted, summary, ranAt: new Date().toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
