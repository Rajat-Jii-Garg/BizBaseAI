const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

const REST = `${SUPABASE_URL}/rest/v1`;

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

/*
|--------------------------------------------------------------------------
| BizBase Community Content Rules
|--------------------------------------------------------------------------
*/

const COMMUNITY_RULES = [
  {
    match: ["startup", "funding", "venture"],
    query: "India startups funding venture capital founders",
    tags: "#Startups #Funding #BizBase",
  },

  {
    match: ["business", "growth", "entrepreneur"],
    query: "India business companies entrepreneurship growth",
    tags: "#Business #Growth #BizBase",
  },

  {
    match: ["stock", "market", "investing", "finance"],
    query: "India stock market NSE BSE markets finance",
    tags: "#IndianStockMarket #Markets #BizBase",
  },

  {
    match: ["economy", "economic"],
    query: "India economy RBI inflation GDP economy",
    tags: "#Economy #India #BizBase",
  },

  {
    match: ["ai", "technology", "tech"],
    query: "AI technology India startups technology business",
    tags: "#AI #Technology #BizBase",
  },

  {
    match: ["global", "world"],
    query: "global markets world economy business",
    tags: "#GlobalMarkets #WorldBusiness #BizBase",
  },

  {
    match: ["job", "career", "careers"],
    query: "India jobs hiring careers employment skills",
    tags: "#Jobs #Careers #BizBase",
  },

  {
    match: ["travel", "tour", "tourism"],
    query: "India world travel tourism destinations travel industry",
    tags: "#Travel #Tourism #BizBase",
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripHtml(value = "") {
  return value
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function xmlTag(xml, tag) {
  const regex = new RegExp(
    `<${escapeRegex(tag)}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapeRegex(tag)}>`,
    "i"
  );

  return regex.exec(xml)?.[1]?.trim() || "";
}

function parseItems(xml) {
  const items = [];

  const blocks =
    xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  for (const block of blocks) {
    const title = stripHtml(
      xmlTag(block, "title")
    );

    const link = stripHtml(
      xmlTag(block, "link")
    );

    const description = stripHtml(
      xmlTag(block, "description")
    );

    const pubDate = stripHtml(
      xmlTag(block, "pubDate")
    );

    const sourceMatch =
      /<source(?:\s[^>]*)?>([\s\S]*?)<\/source>/i.exec(
        block
      );

    const sourceName = stripHtml(
      sourceMatch?.[1] || ""
    );

    if (title && link) {
      items.push({
        title,
        link,
        description,
        pubDate,
        sourceName,
      });
    }
  }

  return items;
}

function getCommunityRule(community) {
  const text = `
    ${community.name || ""}
    ${community.category || ""}
  `.toLowerCase();

  return COMMUNITY_RULES.find((rule) =>
    rule.match.some((word) =>
      text.includes(word)
    )
  );
}

function buildFeedUrl(query) {
  return (
    "https://news.google.com/rss/search" +
    `?q=${encodeURIComponent(query)}` +
    "&hl=en-IN&gl=IN&ceid=IN:en"
  );
}

function createExcerpt(text, maxLength = 260) {
  const clean = stripHtml(text || "");

  if (!clean) return "";

  if (clean.length <= maxLength) {
    return clean;
  }

  return (
    clean.slice(0, maxLength).replace(/\s+\S*$/, "") +
    "..."
  );
}

async function request(path, options = {}) {
  const response = await fetch(
    `${REST}/${path}`,
    {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `${response.status} ${response.statusText}: ${body}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| Communities
|--------------------------------------------------------------------------
*/

async function getCommunities() {
  return request(
    "communities" +
      "?select=id,user_id,name,category,is_private" +
      "&is_private=eq.false" +
      "&order=name.asc"
  );
}

/*
|--------------------------------------------------------------------------
| Duplicate Protection
|--------------------------------------------------------------------------
*/

async function alreadyPublished(
  communityId,
  sourceUrl
) {
  const encodedUrl =
    encodeURIComponent(sourceUrl);

  const rows = await request(
    "community_news_items" +
      `?select=id&community_id=eq.${encodeURIComponent(
        communityId
      )}` +
      `&source_url=eq.${encodedUrl}` +
      "&limit=1"
  );

  return (
    Array.isArray(rows) &&
    rows.length > 0
  );
}

/*
|--------------------------------------------------------------------------
| Select One Community Per Run
|--------------------------------------------------------------------------
|
| Every 2 hours one fresh post is created.
| The target community rotates automatically.
|
*/

function selectCommunity(eligible) {
  if (!eligible.length) {
    return null;
  }

  const slot = Math.floor(
    Date.now() /
      (2 * 60 * 60 * 1000)
  );

  return eligible[
    slot % eligible.length
  ];
}

/*
|--------------------------------------------------------------------------
| Publish
|--------------------------------------------------------------------------
*/

async function publishPost(
  community,
  item,
  rule
) {
  const headline = item.title
    .replace(/\s+/g, " ")
    .trim();

  const excerpt = createExcerpt(
    item.description
  );

  const contentParts = [
    `📰 ${headline}`,
    "",
    excerpt ||
      `A fresh development relevant to ${community.name}.`,
    "",
    "What do you think about this development?",
    "",
    rule.tags,
  ];

  const content =
    contentParts.join("\n");

  /*
   * IMPORTANT:
   *
   * user_id = community.user_id
   *
   * So the post is published under the
   * actual Community Admin account.
   *
   * We do NOT create fake human accounts.
   */

  const postRows = await request(
    "posts",
    {
      method: "POST",

      body: JSON.stringify({
        user_id: community.user_id,

        community_id:
          community.id,

        content,

        is_automated: true,

        automation_type:
          "community_news",

        source_name:
          item.sourceName ||
          "News source",

        source_url:
          item.link,

        community_topic:
          rule.query,
      }),
    }
  );

  const post =
    postRows?.[0];

  if (!post?.id) {
    throw new Error(
      `Post insert failed for ${community.name}`
    );
  }

  /*
   * Save source metadata for:
   * - duplicate protection
   * - moderation
   * - analytics
   */

  await request(
    "community_news_items",
    {
      method: "POST",

      body: JSON.stringify({
        community_id:
          community.id,

        source_url:
          item.link,

        source_name:
          item.sourceName ||
          "News source",

        headline,

        published_at:
          item.pubDate
            ? new Date(
                item.pubDate
              ).toISOString()
            : null,

        post_id:
          post.id,
      }),
    }
  );

  return post.id;
}

/*
|--------------------------------------------------------------------------
| Main
|--------------------------------------------------------------------------
*/

async function main() {
  console.log(
    "Starting BizBase Community News Sync..."
  );

  const communities =
    await getCommunities();

  const eligible =
    communities
      .map((community) => ({
        community,
        rule:
          getCommunityRule(
            community
          ),
      }))
      .filter(
        (item) => item.rule
      );

  if (!eligible.length) {
    console.log(
      "No eligible communities found."
    );

    return;
  }

  const target =
    selectCommunity(
      eligible
    );

  console.log(
    `Selected community: ${target.community.name}`
  );

  const feedUrl =
    buildFeedUrl(
      target.rule.query
    );

  const response =
    await fetch(feedUrl, {
      headers: {
        "User-Agent":
          "BizBase Community News/1.0",
      },
    });

  if (!response.ok) {
    throw new Error(
      `RSS request failed: ${response.status}`
    );
  }

  const xml =
    await response.text();

  if (
    !xml.includes("<rss") &&
    !xml.includes("<feed")
  ) {
    throw new Error(
      "Invalid RSS response"
    );
  }

  const items =
    parseItems(xml)
      .slice(0, 20);

  for (const item of items) {
    const exists =
      await alreadyPublished(
        target.community.id,
        item.link
      );

    if (exists) {
      continue;
    }

    const postId =
      await publishPost(
        target.community,
        item,
        target.rule
      );

    console.log(
      `Published ${postId} -> ${target.community.name}`
    );

    console.log(
      `Headline: ${item.title}`
    );

    return;
  }

  console.log(
    "No new article available for this community."
  );
}

main().catch((error) => {
  console.error(
    "Community News Sync failed:",
    error
  );

  process.exit(1);
});