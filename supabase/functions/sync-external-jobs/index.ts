// BizBase job sync — India-only, real employers, full details.
// Sources (in priority order):
//   1. Adzuna India      (needs ADZUNA_APP_ID + ADZUNA_APP_KEY — free tier)
//   2. Jooble India      (needs JOOBLE_API_KEY — free)
//   3. Himalayas         (free, India-restricted remote roles)
//   4. Remotive          (free, India-tagged remote roles)
//   5. RemoteOK          (free, India-tagged remote roles)
// Every run also: refreshes existing rows, closes expired/stale listings.
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
  requirements: string[] | null;
  benefits: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  application_deadline: string | null;
  is_active: boolean;
};

const stripHtml = (html: string) =>
  (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const mapJobType = (t: string): string => {
  const s = (t || "").toLowerCase();
  if (s.includes("intern")) return "internship";
  if (s.includes("part")) return "part-time";
  if (s.includes("contract") || s.includes("temporary")) return "contract";
  if (s.includes("free")) return "freelance";
  return "full-time";
};

const guessExperience = (title: string, text: string): string => {
  const s = `${title} ${text}`.toLowerCase();
  if (/\b(intern|trainee|fresher|graduate|entry[- ]level|0-1 year|0-2 year)\b/.test(s)) return "entry-level";
  if (/\b(head of|director|vp\b|vice president|chief|cto|ceo|principal)\b/.test(s)) return "executive";
  if (/\b(senior|sr\.|lead|staff|architect|manager|8\+ years|7\+ years|6\+ years|5\+ years)\b/.test(s)) return "senior-level";
  return "mid-level";
};

const guessWorkMode = (location: string, text: string): string => {
  const s = `${location} ${text}`.toLowerCase();
  if (/\bhybrid\b/.test(s)) return "hybrid";
  if (/\b(remote|work from home|wfh|telecommute)\b/.test(s)) return "remote";
  return "on-site";
};

const INDUSTRY_MAP: Array<[RegExp, string]> = [
  [/(software|developer|engineer|it |devops|data|cloud|ai\b|machine learning|qa|tester|programmer|full.?stack|frontend|backend)/i, "Technology"],
  [/(finance|account|audit|bank|invest|tax|ca\b|cfa)/i, "Finance"],
  [/(market|seo|content|social media|brand|growth|advertis)/i, "Marketing"],
  [/(sales|business development|bd\b|account executive|telecall)/i, "Sales"],
  [/(design|ux|ui|graphic|creative|figma)/i, "Design"],
  [/(hr\b|human resource|recruit|talent)/i, "Human Resources"],
  [/(doctor|nurse|medical|health|pharma|clinic)/i, "Healthcare"],
  [/(teacher|tutor|education|academic|professor|trainer)/i, "Education"],
  [/(operations|supply|logistic|warehouse|procurement)/i, "Operations"],
  [/(support|customer service|bpo|voice process)/i, "Customer Support"],
];

const guessIndustry = (title: string, fallback?: string): string => {
  for (const [re, name] of INDUSTRY_MAP) if (re.test(title)) return name;
  return fallback && fallback.trim() ? fallback : "General";
};

const extractBullets = (text: string, keys: RegExp): string[] | null => {
  const lines = (text || "").split("\n").map((l) => l.trim());
  const idx = lines.findIndex((l) => keys.test(l) && l.length < 80);
  if (idx === -1) return null;
  const out: string[] = [];
  for (let i = idx + 1; i < lines.length && out.length < 8; i++) {
    const l = lines[i].replace(/^[•\-*\d.]+\s*/, "").trim();
    if (!l) continue;
    if (/^[A-Z][A-Za-z ]{3,40}:?$/.test(l) && l.length < 40 && out.length) break;
    out.push(l.slice(0, 220));
  }
  return out.length ? out : null;
};

// STRICT India-only check.
const INDIA_REGEX =
  /(\bindia\b|bharat|bangalore|bengaluru|mumbai|navi mumbai|thane|\bdelhi\b|new delhi|gurgaon|gurugram|noida|ghaziabad|faridabad|hyderabad|secunderabad|chennai|pune|kolkata|ahmedabad|jaipur|kochi|cochin|indore|chandigarh|lucknow|nagpur|coimbatore|madurai|trichy|trivandrum|thiruvananthapuram|mysore|mysuru|vadodara|surat|rajkot|bhopal|patna|ranchi|raipur|guwahati|bhubaneswar|visakhapatnam|vizag|vijayawada|\bgoa\b|kerala|gujarat|maharashtra|karnataka|tamil nadu|telangana|andhra pradesh|punjab|haryana|rajasthan|uttar pradesh|madhya pradesh|west bengal|odisha|assam|jharkhand|chhattisgarh|uttarakhand|himachal)/i;

const isIndia = (location: string): boolean => !!location && INDIA_REGEX.test(location);

const inrOrNull = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n) || n <= 0) return null;
  return Math.round(n);
};

/* ------------------------------ SOURCES ------------------------------ */

async function fetchAdzuna(): Promise<JobRow[]> {
  const appId = Deno.env.get("ADZUNA_APP_ID");
  const appKey = Deno.env.get("ADZUNA_APP_KEY");
  if (!appId || !appKey) throw new Error("skip: ADZUNA_APP_ID/ADZUNA_APP_KEY not configured");

  const rows: JobRow[] = [];
  // Multiple pages across broad categories to maximise coverage of real Indian jobs.
  const pages = [1, 2, 3, 4, 5];
  for (const page of pages) {
    const url =
      `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${appId}&app_key=${appKey}` +
      `&results_per_page=50&max_days_old=7&content-type=application/json&sort_by=date`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Adzuna HTTP ${res.status}`);
    const data = await res.json();
    for (const j of (data.results || []) as any[]) {
      const location = j.location?.display_name || "India";
      if (!isIndia(location)) continue;
      const desc = stripHtml(j.description || "");
      rows.push({
        source: "adzuna",
        external_id: String(j.id),
        external_url: j.redirect_url,
        title: String(j.title || "Untitled").replace(/<[^>]+>/g, "").slice(0, 200),
        company_name: j.company?.display_name || "Confidential",
        location,
        job_type: mapJobType(j.contract_time || j.contract_type || ""),
        work_mode: guessWorkMode(location, desc),
        experience_level: guessExperience(j.title || "", desc),
        industry: guessIndustry(j.title || "", j.category?.label),
        description: desc.slice(0, 6000),
        skills_required: null,
        requirements: extractBullets(desc, /(requirement|qualification|you should|what we expect|skills)/i),
        benefits: extractBullets(desc, /(benefit|perks|what we offer|we offer)/i),
        salary_min: inrOrNull(j.salary_min),
        salary_max: inrOrNull(j.salary_max),
        salary_currency: j.salary_min ? "INR" : null,
        application_deadline: null,
        is_active: true,
      });
    }
    if ((data.results || []).length < 50) break;
  }
  return rows;
}

async function fetchJooble(): Promise<JobRow[]> {
  const key = Deno.env.get("JOOBLE_API_KEY");
  if (!key) throw new Error("skip: JOOBLE_API_KEY not configured");
  const rows: JobRow[] = [];
  const keywords = ["software developer", "sales", "marketing", "accountant", "designer", "internship", "customer support", "data analyst"];
  for (const kw of keywords) {
    const res = await fetch(`https://in.jooble.org/api/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: kw, location: "India", page: "1" }),
    });
    if (!res.ok) throw new Error(`Jooble HTTP ${res.status}`);
    const data = await res.json();
    for (const j of (data.jobs || []) as any[]) {
      const location = j.location || "India";
      if (!isIndia(location)) continue;
      const desc = stripHtml(j.snippet || "");
      rows.push({
        source: "jooble",
        external_id: String(j.id),
        external_url: j.link,
        title: String(j.title || "Untitled").slice(0, 200),
        company_name: j.company || "Confidential",
        location,
        job_type: mapJobType(j.type || ""),
        work_mode: guessWorkMode(location, desc),
        experience_level: guessExperience(j.title || "", desc),
        industry: guessIndustry(j.title || ""),
        description: desc.slice(0, 6000),
        skills_required: null,
        requirements: null,
        benefits: null,
        salary_min: null,
        salary_max: null,
        salary_currency: null,
        application_deadline: null,
        is_active: true,
      });
    }
  }
  return rows;
}

async function fetchHimalayas(): Promise<JobRow[]> {
  const res = await fetch("https://himalayas.app/jobs/api?limit=100");
  if (!res.ok) throw new Error(`Himalayas HTTP ${res.status}`);
  const data = await res.json();
  const jobs = (data.jobs || []) as any[];
  return jobs
    .filter((j) => (j.locationRestrictions || []).some((l: string) => isIndia(l)))
    .map((j) => {
      const desc = stripHtml(j.description || j.excerpt || "");
      return {
        source: "himalayas",
        external_id: String(j.guid),
        external_url: j.applicationLink,
        title: String(j.title || "Untitled").slice(0, 200),
        company_name: j.companyName || "Confidential",
        location: "India (Remote)",
        job_type: mapJobType(j.employmentType || ""),
        work_mode: "remote",
        experience_level: guessExperience(j.title || "", j.seniority || ""),
        industry: guessIndustry(j.title || "", (j.categories || [])[0]),
        description: desc.slice(0, 6000),
        skills_required: Array.isArray(j.categories) ? j.categories.slice(0, 10) : null,
        requirements: extractBullets(desc, /(requirement|qualification|skills)/i),
        benefits: extractBullets(desc, /(benefit|perks|we offer)/i),
        salary_min: inrOrNull(j.minSalary),
        salary_max: inrOrNull(j.maxSalary),
        salary_currency: j.minSalary ? (j.currency || "USD") : null,
        application_deadline: j.expiryDate ? new Date(j.expiryDate * 1000).toISOString().slice(0, 10) : null,
        is_active: true,
      } as JobRow;
    });
}

async function fetchRemotive(): Promise<JobRow[]> {
  const res = await fetch("https://remotive.com/api/remote-jobs?limit=200");
  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`);
  const data = await res.json();
  return ((data.jobs || []) as any[])
    .filter((j) => isIndia(j.candidate_required_location || ""))
    .map((j) => {
      const desc = stripHtml(j.description || "");
      return {
        source: "remotive",
        external_id: String(j.id),
        external_url: j.url,
        title: (j.title || "Untitled").slice(0, 200),
        company_name: j.company_name || "Confidential",
        location: j.candidate_required_location || "India",
        job_type: mapJobType(j.job_type),
        work_mode: "remote",
        experience_level: guessExperience(j.title || "", desc),
        industry: guessIndustry(j.title || "", j.category),
        description: desc.slice(0, 6000),
        skills_required: Array.isArray(j.tags) ? j.tags.slice(0, 10) : null,
        requirements: extractBullets(desc, /(requirement|qualification|skills)/i),
        benefits: extractBullets(desc, /(benefit|perks|we offer)/i),
        salary_min: null,
        salary_max: null,
        salary_currency: null,
        application_deadline: null,
        is_active: true,
      } as JobRow;
    });
}

async function fetchRemoteOK(): Promise<JobRow[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": "BizBase Job Sync (support@bizbase-ai.com)" },
  });
  if (!res.ok) throw new Error(`RemoteOK HTTP ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .slice(1)
    .filter((j: any) => isIndia(j.location || ""))
    .slice(0, 80)
    .map((j: any) => {
      const desc = stripHtml(j.description || "");
      return {
        source: "remoteok",
        external_id: String(j.id || j.slug),
        external_url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
        title: (j.position || "Untitled").slice(0, 200),
        company_name: j.company || "Confidential",
        location: j.location || "India",
        job_type: "full-time",
        work_mode: "remote",
        experience_level: guessExperience(j.position || "", desc),
        industry: guessIndustry(j.position || "", (j.tags || [])[0]),
        description: desc.slice(0, 6000),
        skills_required: Array.isArray(j.tags) ? j.tags.slice(0, 10) : null,
        requirements: extractBullets(desc, /(requirement|qualification|skills)/i),
        benefits: extractBullets(desc, /(benefit|perks|we offer)/i),
        salary_min: inrOrNull(j.salary_min),
        salary_max: inrOrNull(j.salary_max),
        salary_currency: j.salary_min ? "USD" : null,
        application_deadline: null,
        is_active: true,
      } as JobRow;
    });
}

/* ------------------------------ HANDLER ------------------------------ */

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

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // 1. Close jobs past their deadline
  try {
    await supabase
      .from("jobs")
      .update({ is_active: false })
      .lt("application_deadline", new Date().toISOString().slice(0, 10))
      .eq("is_active", true);
  } catch (e) {
    console.error("Auto-close (deadline) failed", e);
  }

  // 2. Close stale external listings (older than 45 days — likely filled)
  try {
    const cutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("jobs")
      .update({ is_active: false })
      .neq("source", "internal")
      .lt("created_at", cutoff)
      .eq("is_active", true);
  } catch (e) {
    console.error("Auto-close (stale) failed", e);
  }

  const summary: Record<string, unknown> = {};
  const sources: Array<{ name: string; fn: () => Promise<JobRow[]> }> = [
    { name: "adzuna", fn: fetchAdzuna },
    { name: "jooble", fn: fetchJooble },
    { name: "himalayas", fn: fetchHimalayas },
    { name: "remotive", fn: fetchRemotive },
    { name: "remoteok", fn: fetchRemoteOK },
  ];

  let totalInserted = 0;
  let totalUpdated = 0;

  for (const src of sources) {
    try {
      const raw = await src.fn();
      // De-dupe within the batch by external_id
      const seen = new Set<string>();
      const rows = raw.filter((r) => {
        if (!r.external_id || !r.external_url || seen.has(r.external_id)) return false;
        seen.add(r.external_id);
        return true;
      });

      if (rows.length === 0) {
        summary[src.name] = { fetched: 0, inserted: 0 };
        continue;
      }

      const ids = rows.map((r) => r.external_id);
      const existing: Array<{ external_id: string }> = [];
      for (let i = 0; i < ids.length; i += 200) {
        const { data, error } = await supabase
          .from("jobs")
          .select("external_id")
          .eq("source", src.name)
          .in("external_id", ids.slice(i, i + 200));
        if (error) throw error;
        existing.push(...((data || []) as any[]));
      }
      const existingSet = new Set(existing.map((r) => r.external_id));

      const newRows = rows.filter((r) => !existingSet.has(r.external_id));
      const dupRows = rows.filter((r) => existingSet.has(r.external_id));

      // Insert new listings in chunks
      let inserted = 0;
      for (let i = 0; i < newRows.length; i += 100) {
        const chunk = newRows.slice(i, i + 100);
        const { error } = await supabase.from("jobs").insert(chunk);
        if (error) throw error;
        inserted += chunk.length;
      }

      // Refresh details of listings we already have (keeps them accurate + active)
      let updated = 0;
      for (const r of dupRows.slice(0, 100)) {
        const { error } = await supabase
          .from("jobs")
          .update({
            title: r.title,
            company_name: r.company_name,
            location: r.location,
            description: r.description,
            external_url: r.external_url,
            salary_min: r.salary_min,
            salary_max: r.salary_max,
            salary_currency: r.salary_currency,
            requirements: r.requirements,
            benefits: r.benefits,
            skills_required: r.skills_required,
            is_active: true,
          })
          .eq("source", src.name)
          .eq("external_id", r.external_id);
        if (!error) updated += 1;
      }

      summary[src.name] = { fetched: rows.length, inserted, refreshed: updated };
      totalInserted += inserted;
      totalUpdated += updated;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("skip:")) {
        summary[src.name] = { skipped: msg.replace("skip: ", "") };
      } else {
        console.error(`[${src.name}] sync failed`, msg);
        summary[src.name] = { error: msg };
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      inserted: totalInserted,
      refreshed: totalUpdated,
      summary,
      ranAt: new Date().toISOString(),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
