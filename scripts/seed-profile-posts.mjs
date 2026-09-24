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

async function request(path, options = {}) {
  const response = await fetch(`${REST}/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function makePost(profile) {
  const profession = clean(profile.profession) || 'professional';
  const company = clean(profile.company_name);
  const position = clean(profile.current_position);
  const skills = Array.isArray(profile.skills) ? profile.skills.filter(Boolean).slice(0, 3) : [];

  const topics = [
    `One thing I have learned as a ${profession}: consistency compounds faster than occasional bursts of effort.`,
    `A useful reminder for professionals: keep learning, keep shipping, and keep talking to people outside your usual circle.`,
    `I am currently focused on improving how I work, communicate, and turn ideas into useful outcomes. Small progress every day matters.`,
    `Networking becomes much more useful when you start with curiosity and value instead of immediately asking for something.`,
  ];

  let post = topics[Math.floor(Math.random() * topics.length)];
  if (position) post += ` My current focus is ${position}.`;
  if (company) post += ` Working at ${company} keeps that lesson practical.`;
  if (skills.length) post += ` Learning: ${skills.join(', ')}.`;

  return post.slice(0, 900);
}

async function main() {
  const bots = await request(
    'profiles?select=id,full_name,profession,current_position,company_name,skills&is_seed_bot=eq.true&order=full_name.asc',
  );

  if (!bots?.length) {
    console.log('No opt-in seed contributor profiles found.');
    return;
  }

  const recentSince = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
  const recent = await request(
    `posts?select=user_id,created_at&created_at=gte.${encodeURIComponent(recentSince)}&user_id=in.(${bots.map((b) => b.id).join(',')})`,
  );
  const recentIds = new Set((recent || []).map((row) => row.user_id));
  const available = bots.filter((bot) => !recentIds.has(bot.id));

  if (!available.length) {
    console.log('Seed contributor posts skipped: all contributors posted within the last 4 hours.');
    return;
  }

  const profile = available[Math.floor(Math.random() * available.length)];
  const content = makePost(profile);

  // Community assignment is optional. This keeps the same post visible on the
  // contributor profile and inside a community when a community is selected.
  const communities = await request(
    'communities?select=id,name&is_private=eq.false&order=updated_at.desc&limit=20',
  );

  const community = communities?.length
    ? communities[Math.floor(Math.random() * communities.length)]
    : null;

  const row = {
    user_id: profile.id,
    content,
    community_id: community?.id || null,
  };

  const inserted = await request('posts', {
    method: 'POST',
    body: JSON.stringify(row),
  });

  console.log(
    `Contributor post created: ${profile.full_name} -> ${community?.name || 'global profile feed'} -> ${inserted?.[0]?.id || 'unknown id'}`,
  );
}

main().catch((error) => {
  console.error('Seed contributor post failed:', error);
  process.exit(1);
});
