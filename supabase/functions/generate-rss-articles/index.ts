import { createClient } from "npm:@supabase/supabase-js@2";
import { XMLParser } from "npm:fast-xml-parser@4.5.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash-lite";
const ARTICLE_CRON_SECRET = Deno.env.get("ARTICLE_CRON_SECRET");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-article-cron-secret",
  "Content-Type": "application/json",
};

const BASE_URL = "https://bizbase-ai.vercel.app";
const MAX_RUN_ARTICLES = 3;

/**
 * Google News RSS search feeds. These are intentionally narrow so BizBase
 * publishes a small number of useful articles instead of flooding Google or
 * the product with low-value pages.
 */
const RSS_FEEDS = [
  {
    key: "india-business",
    category: "Business",
    region: "India",
    url: "https://news.google.com/rss/search?q=India%20business%20when%3A1d&hl=en-IN&gl=IN&ceid=IN%3Aen",
  },
  {
    key: "india-startups",
    category: "Startups",
    region: "India",
    url: "https://news.google.com/rss/search?q=India%20startups%20funding%20when%3A2d&hl=en-IN&gl=IN&ceid=IN%3Aen",
  },
  {
    key: "india-fundraising",
    category: "Fundraising",
    region: "India",
    url: "https://news.google.com/rss/search?q=India%20startup%20fundraising%20investment%20when%3A2d&hl=en-IN&gl=IN&ceid=IN%3Aen",
  },
  {
    key: "global-business",
    category: "Business",
    region: "Global",
    url: "https://news.google.com/rss/search?q=global%20business%20markets%20companies%20when%3A1d&hl=en&gl=US&ceid=US%3Aen",
  },
  {
    key: "global-startups",
    category: "Startups",
    region: "Global",
    url: "https://news.google.com/rss/search?q=global%20startups%20technology%20when%3A2d&hl=en&gl=US&ceid=US%3Aen",
  },
  {
    key: "global-fundraising",
    category: "Fundraising",
    region: "Global",
    url: "https://news.google.com/rss/search?q=global%20startup%20fundraising%20venture%20capital%20when%3A2d&hl=en&gl=US&ceid=US%3Aen",
  },
];

type Candidate = {
  feedKey: string;
  category: string;
  region: string;
  title: string;
  link: string;
  guid: string;
  sourceName: string;
  publishedAt: string | null;
  description: string;
  imageUrl: string | null;
  feedRank: number;
};

type Editorial = {
  headline: string;
  seo_title: string;
  meta_description: string;
  excerpt: string;
  summary: string;
  why_it_matters: string;
  key_points: string[];
  bizbase_takeaway: string;
  tags: string[];
};

function normalizeArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value: any): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (typeof value["#text"] === "string") return value["#text"];
    if (typeof value.text === "string") return value.text;
  }
  return "";
}

function attrValue(value: any, key: string): string | null {
  if (!value || typeof value !== "object") return null;
  return value[`@_${key}`] ? String(value[`@_${key}`]) : null;
}

function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function safeDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(input: string): string {
  return normalizeTitle(input).replace(/\s+/g, "-").slice(0, 100) || `article-${Date.now()}`;
}

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseGoogleNewsRss(xml: string, feed: typeof RSS_FEEDS[number]): Candidate[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsed = parser.parse(xml);
  const rawItems = normalizeArray(parsed?.rss?.channel?.item);

  return rawItems.map((item: any, index) => {
    const media = item?.["media:content"] || item?.["media:thumbnail"] || null;
    const enclosure = item?.enclosure || null;
    const imageUrl = attrValue(media, "url") || attrValue(enclosure, "url");

    return {
      feedKey: feed.key,
      category: feed.category,
      region: feed.region,
      title: stripHtml(textValue(item?.title)),
      link: textValue(item?.link),
      guid: textValue(item?.guid) || textValue(item?.link),
      sourceName: textValue(item?.source) || new URL(feed.url).hostname,
      publishedAt: safeDate(textValue(item?.pubDate)),
      description: stripHtml(textValue(item?.description)),
      imageUrl,
      feedRank: index,
    };
  }).filter((item) => item.title && item.link);
}

async function fetchFeed(feed: typeof RSS_FEEDS[number]): Promise<Candidate[]> {
  const response = await fetch(feed.url, {
    headers: {
      "User-Agent": "BizBaseNewsBot/1.0 (+https://bizbase-ai.vercel.app)",
      "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`${feed.key}: RSS ${response.status}`);
  }

  const xml = await response.text();
  return parseGoogleNewsRss(xml, feed);
}

function candidateScore(candidate: Candidate): number {
  const now = Date.now();
  const published = candidate.publishedAt ? new Date(candidate.publishedAt).getTime() : now;
  const ageHours = Math.max(0, (now - published) / 3_600_000);
  const freshness = Math.max(0, 48 - ageHours) * 2;
  const rankScore = Math.max(0, 30 - candidate.feedRank);
  const keywordBonus = /(funding|fundraise|investment|acquisition|ipo|startup|ai|business|market|revenue|profit|launch)/i.test(candidate.title) ? 12 : 0;
  return freshness + rankScore + keywordBonus;
}

function isFreshEnough(candidate: Candidate): boolean {
  if (!candidate.publishedAt) return true;
  const ageHours = (Date.now() - new Date(candidate.publishedAt).getTime()) / 3_600_000;
  return ageHours <= 72;
}

function extractJson(text: string): Editorial {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Gemini returned non-JSON editorial output");
  const parsed = JSON.parse(cleaned.slice(start, end + 1));

  const keyPoints = Array.isArray(parsed.key_points)
    ? parsed.key_points.map((v: unknown) => String(v).trim()).filter(Boolean).slice(0, 5)
    : [];
  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.map((v: unknown) => String(v).trim()).filter(Boolean).slice(0, 8)
    : [];

  if (!parsed.headline || !parsed.summary || keyPoints.length === 0) {
    throw new Error("Editorial output missing required fields");
  }

  return {
    headline: String(parsed.headline).trim().slice(0, 150),
    seo_title: String(parsed.seo_title || parsed.headline).trim().slice(0, 70),
    meta_description: String(parsed.meta_description || parsed.excerpt || parsed.summary).trim().slice(0, 165),
    excerpt: String(parsed.excerpt || parsed.summary).trim().slice(0, 260),
    summary: String(parsed.summary).trim(),
    why_it_matters: String(parsed.why_it_matters || "").trim(),
    key_points: keyPoints,
    bizbase_takeaway: String(parsed.bizbase_takeaway || "").trim(),
    tags,
  };
}

async function generateEditorial(candidate: Candidate): Promise<Editorial> {
  const prompt = `You are the BizBase Editorial Desk, writing an original business-news brief for Indian and global professionals.

SOURCE METADATA (the only factual material you may rely on):
Source: ${candidate.sourceName}
Published: ${candidate.publishedAt || "Unknown"}
Original headline: ${candidate.title}
Original snippet: ${candidate.description || "No snippet provided"}
Original URL: ${candidate.link}
Category: ${candidate.category}
Region: ${candidate.region}

Create a genuinely useful, ORIGINAL editorial brief. Do not copy sentences from the source, do not imitate the source's article structure, and do not invent facts, numbers, quotes, people, dates, funding amounts, or details that are not in the metadata above.

The BizBase article should explain what happened, why a professional should care, and what action/lesson follows from it. Mention uncertainty when the snippet is incomplete.

Return ONLY valid JSON with exactly these keys:
headline: concise, human headline
seo_title: natural search title, not keyword stuffing, <= 65 chars
meta_description: <= 155 chars
excerpt: 1-2 sentence summary
summary: 2-4 short paragraphs worth of substance
why_it_matters: 1-2 paragraphs for professionals
key_points: 3-5 short factual bullets
bizbase_takeaway: 1 short actionable takeaway
 tags: 4-8 lowercase topic tags
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1300,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return extractJson(text);
}

async function uniqueSlug(supabase: ReturnType<typeof createClient>, title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;

  for (let i = 0; i < 5; i += 1) {
    const { data } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i + 2}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}

function buildPlainContent(editorial: Editorial): string {
  const bullets = editorial.key_points.map((point) => `- ${point}`).join("\n");
  return [
    `Summary\n${editorial.summary}`,
    editorial.why_it_matters ? `Why it matters\n${editorial.why_it_matters}` : "",
    `Key points\n${bullets}`,
    editorial.bizbase_takeaway ? `BizBase takeaway\n${editorial.bizbase_takeaway}` : "",
  ].filter(Boolean).join("\n\n");
}

async function alreadyExists(supabase: ReturnType<typeof createClient>, candidate: Candidate): Promise<boolean> {
  const key = await sha256(`${candidate.sourceName}|${candidate.guid}|${candidate.link}`);
  const { data } = await supabase.from("blog_posts").select("id").eq("source_key", key).maybeSingle();
  if (data) return true;

  // Secondary deduplication for different Google News result URLs pointing to the same story.
  const normalized = normalizeTitle(candidate.title);
  const { data: recent } = await supabase
    .from("blog_posts")
    .select("id, title, created_at")
    .eq("is_published", true)
    .gte("created_at", new Date(Date.now() - 72 * 3_600_000).toISOString())
    .ilike("title", `%${normalized.slice(0, 60)}%`)
    .limit(1);
  return Boolean(recent?.length);
}

async function chooseCandidate(supabase: ReturnType<typeof createClient>): Promise<Candidate | null> {
  const fetched = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));
  const all: Candidate[] = [];

  for (const result of fetched) {
    if (result.status === "fulfilled") all.push(...result.value);
  }

  const filtered = all.filter(isFreshEnough);
  const sorted = filtered.sort((a, b) => candidateScore(b) - candidateScore(a));

  for (const candidate of sorted) {
    if (!(await alreadyExists(supabase, candidate))) return candidate;
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const suppliedSecret = req.headers.get("x-article-cron-secret");
  if (!ARTICLE_CRON_SECRET || suppliedSecret !== ARTICLE_CRON_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
  }

  try {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    let limit = 1;
    try {
      const body = await req.json();
      if (typeof body?.limit === "number") limit = Math.min(Math.max(body.limit, 1), MAX_RUN_ARTICLES);
    } catch (_) {
      // Body is optional.
    }

    const run = await supabase
      .from("article_ingestion_runs")
      .insert({ status: "running" })
      .select("id")
      .single();

    const runId = run.data?.id;
    const candidates: Candidate[] = [];
    const published: string[] = [];
    const errors: string[] = [];
    let skipped = 0;

    for (let i = 0; i < limit; i += 1) {
      try {
        const candidate = await chooseCandidate(supabase);
        if (!candidate) {
          skipped += 1;
          continue;
        }

        candidates.push(candidate);
        const editorial = await generateEditorial(candidate);
        const sourceKey = await sha256(`${candidate.sourceName}|${candidate.guid}|${candidate.link}`);
        const slug = await uniqueSlug(supabase, editorial.headline);

        const { data: article, error: insertError } = await supabase
          .from("blog_posts")
          .insert({
            title: editorial.headline,
            slug,
            content: buildPlainContent(editorial),
            excerpt: editorial.excerpt,
            author_id: null,
            author_name: "BizBase Editorial Desk",
            category: candidate.category,
            region: candidate.region,
            tags: editorial.tags,
            is_published: true,
            views_count: 0,
            source_name: candidate.sourceName,
            source_url: candidate.link,
            source_published_at: candidate.publishedAt,
            source_key: sourceKey,
            seo_title: editorial.seo_title,
            meta_description: editorial.meta_description,
            content_json: {
              summary: editorial.summary,
              why_it_matters: editorial.why_it_matters,
              key_points: editorial.key_points,
              bizbase_takeaway: editorial.bizbase_takeaway,
              source_note: `Original BizBase editorial summary based on reporting from ${candidate.sourceName}. Read the original report at the source link.`,
            },
            is_ai_assisted: true,
          })
          .select("id, slug, title")
          .single();

        if (insertError) throw insertError;
        published.push(article.id);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    if (runId) {
      await supabase
        .from("article_ingestion_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: errors.length && published.length === 0 ? "failed" : "completed",
          candidates_count: candidates.length,
          published_count: published.length,
          skipped_count: skipped,
          errors,
        })
        .eq("id", runId);
    }

    return new Response(JSON.stringify({
      ok: true,
      published_count: published.length,
      published,
      candidates: candidates.map((c) => ({ title: c.title, source: c.sourceName, category: c.category })),
      skipped,
      errors,
    }), { headers: CORS_HEADERS });
  } catch (error) {
    console.error("generate-rss-articles error", error);
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
