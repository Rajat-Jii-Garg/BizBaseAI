import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const baseUrl = "https://bizbase-ai.vercel.app";

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(url: string, lastmod?: string) {
  return `<url><loc>${xmlEscape(url)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}</url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const staticPages = [
    "", "articles", "login", "signup", "forget-password", "demo", "contact", "faq",
    "dashboard", "network", "messages", "notifications", "connections", "communities",
    "settings", "events", "insights", "ai-assistant", "jobs", "my-businesses",
    "business-setup", "sitemap", "about", "whatsappcommunity",
  ];

  const cities = ["bangalore", "mumbai", "delhi", "gurgaon", "noida", "hyderabad", "pune", "chennai", "kolkata", "ahmedabad", "jaipur", "remote"];
  const roles = ["software-developer", "data-analyst", "digital-marketing", "sales-executive", "graphic-designer", "hr-recruiter", "accountant", "customer-support", "internship", "fresher"];

  const urls: string[] = staticPages.map((p) => urlEntry(`${baseUrl}/${p}`));
  cities.forEach((c) => urls.push(urlEntry(`${baseUrl}/jobs-in/${c}`)));
  roles.forEach((r) => urls.push(urlEntry(`${baseUrl}/jobs-for/${r}`)));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .not("username", "is", null);
  (profiles || []).forEach((p) => {
    if (p.username) urls.push(urlEntry(`${baseUrl}/${p.username}`, p.updated_at));
  });

  const { data: communities } = await supabase
    .from("communities")
    .select("id, updated_at");
  (communities || []).forEach((c) => urls.push(urlEntry(`${baseUrl}/communities/${c.id}`, c.updated_at)));

  const { data: jobs } = await supabase
    .from("jobs")
    .select("slug, updated_at, created_at")
    .eq("is_active", true)
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(5000);
  (jobs || []).forEach((j) => urls.push(urlEntry(`${baseUrl}/jobs/${j.slug}`, j.updated_at || j.created_at)));

  const { data: articles } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, created_at")
    .eq("is_published", true)
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(10000);
  (articles || []).forEach((article) => urls.push(urlEntry(`${baseUrl}/articles/${article.slug}`, article.updated_at || article.created_at)));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml" },
  });
});
