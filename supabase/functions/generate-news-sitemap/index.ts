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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Google News sitemaps are intended for recently published news URLs.
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data: articles, error } = await supabase
    .from("blog_posts")
    .select("slug,title,created_at,updated_at")
    .eq("is_published", true)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const urls = (articles || []).map((article) => {
    const published = new Date(article.created_at).toISOString();
    return `
  <url>
    <loc>${xmlEscape(`${baseUrl}/articles/${article.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>BizBase AI</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${published}</news:publication_date>
      <news:title>${xmlEscape(article.title)}</news:title>
    </news:news>
    <lastmod>${new Date(article.updated_at || article.created_at).toISOString()}</lastmod>
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml" },
  });
});
