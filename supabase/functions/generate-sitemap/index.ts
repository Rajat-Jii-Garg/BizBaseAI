import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const baseUrl = "https://bizbase-ai.lovable.app";

  const staticPages = [
    "", "login", "signup", "forget-password", "demo", "contact", "faq",
    "dashboard", "network", "messages", "notifications", "connections",
    "communities", "settings", "events", "insights", "ai-assistant",
    "jobs", "my-businesses", "business-setup", "sitemap",
  ];

  let urls = staticPages.map((p) => `<url><loc>${baseUrl}/${p}</loc><changefreq>weekly</changefreq><priority>${p === "" ? "1.0" : "0.7"}</priority></url>`);

  // Profiles
  const { data: profiles } = await supabase.from("profiles").select("username, updated_at").not("username", "is", null);
  (profiles || []).forEach((p) => {
    urls.push(`<url><loc>${baseUrl}/${p.username}</loc><lastmod>${new Date(p.updated_at || Date.now()).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`);
  });

  // Posts
  const { data: posts } = await supabase.from("posts").select("id, user_id, created_at").order("created_at", { ascending: false }).limit(500);
  if (posts?.length) {
    const userIds = [...new Set(posts.map((p) => p.user_id))];
    const { data: profs } = await supabase.from("profiles").select("id, username").in("id", userIds);
    const map: Record<string, string> = {};
    (profs || []).forEach((p) => { map[p.id] = p.username; });

    posts.forEach((p) => {
      if (map[p.user_id]) {
        urls.push(`<url><loc>${baseUrl}/${map[p.user_id]}/post/${p.id}</loc><lastmod>${new Date(p.created_at).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`);
      }
    });
  }

  // Communities
  const { data: communities } = await supabase.from("communities").select("id, updated_at");
  (communities || []).forEach((c) => {
    urls.push(`<url><loc>${baseUrl}/communities/${c.id}</loc><lastmod>${new Date(c.updated_at || Date.now()).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { ...corsHeaders, "Content-Type": "application/xml" },
  });
});
