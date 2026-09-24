const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const REST = `${SUPABASE_URL}/rest/v1`;
const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

const COMMUNITY_RULES = [
  {
    match: ['startup', 'funding', 'venture'],
    query: 'India startups funding venture capital founders',
    tags: '#Startups #Funding #BizBase',
  },
  {
    match: ['business', 'growth', 'entrepreneur'],
    query: 'India business companies entrepreneurship growth',
    tags: '#Business #Growth #BizBase',
  },
  {
    match: ['stock', 'market', 'investing', 'finance'],
    query: 'India stock market NSE BSE business markets',
    tags: '#IndianStockMarket #Markets #BizBase',
  },
  {
    match: ['economy', 'economic'],
    query: 'India economy RBI inflation GDP economy',
    tags: '#Economy #India #BizBase',
  },
  {
    match: ['ai', 'technology', 'tech'],
    query: 'AI technology India startups technology business',
    tags: '#AI #Technology #BizBase',
  },
  {
    match: ['global', 'world', 'markets'],
    query: 'global markets world economy business markets',
    tags: '#GlobalMarkets #Business #BizBase',
  },
  {
    match: ['job', 'career', 'careers'],
    query: 'India jobs hiring careers skills employment',
    tags: '#Jobs #Careers #BizBase',
  },
  {
    match: ['travel', 'tour', 'tourism'],
    query: 'India world travel tourism destinations travel industry',
    tags: '#Travel #Tourism #BizBase',
  },
];

function escRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripHtml(value = '') {
  return value
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function xmlTag(xml, tag) {
  const re = new RegExp(`<${escRegex(tag)}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escRegex(tag)}>`, 'i');
  return re.exec(xml)?.[1]?.trim() || '';
}

function parseItems(xml) {
  const items = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = stripHtml(xmlTag(block, 'title'));
    const link = stripHtml(xmlTag(block, 'link'));
    const description = stripHtml(xmlTag(block, 'description'));
    const pubDate = stripHtml(xmlTag(block, 'pubDate'));
    const sourceMatch = /<source(?:\s[^>]*)?>([\s\S]*?)<\/source>/i.exec(block);
    const sourceName = stripHtml(sourceMatch?.[1] || '');
    if (title && link) items.push({ title, link, description, pubDate, sourceName });
  }
  return items;
}

function pickRule(community) {
  const haystack = `${community.name || ''} ${community.category || ''}`.toLowerCase();
  return COMMUNITY_RULES.find((rule) => rule.match.some((word) => haystack.includes(word)));
}

function buildFeedUrl(query) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${REST}/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }
  return response.status === 204 ? null : response.json();
}

async function fetchCommunities() {
  return fetchJson('communities?select=id,user_id,name,category,is_private&is_private=eq.false&order=name.asc');
}

async function alreadyPublished(communityId, url) {
  const rows = await fetchJson(
    `community_news_items?select=id&community_id=eq.${encodeURIComponent(communityId)}&source_url=eq.${encodeURIComponent(url)}&limit=1`,
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function publish(community, item, rule) {
  const headline = item.title.replace(/\s+/g, ' ').trim();
  const content = [
    `📰 ${headline}`,
    '',
    `BizBase Community Update: Fresh developments relevant to ${community.name}.`,
    '',
    'What is your take on this development?',
    '',
    rule.tags,
  ].join('\n');

  const postRows = await fetchJson('posts', {
    method: 'POST',
    body: JSON.stringify({
      user_id: community.user_id,
      community_id: community.id,
      content,
      is_automated: true,
      automation_type: 'community_news',
      source_name: item.sourceName || 'News source',
      source_url: item.link,
      community_topic: rule.query,
    }),
  });

  const post = postRows?.[0];
  if (!post?.id) throw new Error(`Post insert returned no row for ${community.name}`);

  await fetchJson('community_news_items', {
    method: 'POST',
    body: JSON.stringify({
      community_id: community.id,
      source_url: item.link,
      source_name: item.sourceName || 'News source',
      headline,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      post_id: post.id,
    }),
  });

  return post.id;
}

async function main() {
  const communities = await fetchCommunities();
  const eligible = communities.map((community) => ({ community, rule: pickRule(community) })).filter((x) => x.rule);

  if (!eligible.length) {
    console.log('No matching public communities found. Create the BizBase news communities first.');
    return;
  }

  // One fresh post per run. The slot rotates through communities so the system
  // produces a steady stream rather than flooding every community at once.
  const slot = Math.floor(Date.now() / (3 * 60 * 60 * 1000));
  const target = eligible[slot % eligible.length];

  const xml = await (await fetch(buildFeedUrl(target.rule.query), { headers: { 'User-Agent': 'BizBase Community News Bot/1.0' } })).text();
  if (!xml.includes('<rss') && !xml.includes('<feed')) throw new Error('RSS feed did not return expected XML');

  const items = parseItems(xml).slice(0, 12);
  for (const item of items) {
    if (await alreadyPublished(target.community.id, item.link)) continue;
    const postId = await publish(target.community, item, target.rule);
    console.log(`Published ${postId} -> ${target.community.name} -> ${item.title}`);
    return;
  }

  console.log(`No new source item found for ${target.community.name}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
