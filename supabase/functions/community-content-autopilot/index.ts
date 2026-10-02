import { createClient } from "npm:@supabase/supabase-js@2";
import { XMLParser } from "npm:fast-xml-parser@4.5.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL =
  Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash-lite";

const AUTOMATION_SECRET =
  Deno.env.get("COMMUNITY_AUTOPILOT_SECRET");

const supabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-community-autopilot-secret",
  "Content-Type": "application/json",
};

type FeedConfig = {
  name: string;
  url: string;
};

type Candidate = {
  title: string;
  link: string;
  description: string;
  sourceName: string;
  publishedAt: string | null;
  rank: number;
};

function clean(value: unknown): string {
  return String(value || "")
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function arr<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: any): string {
  if (typeof value === "string") return value;

  if (
    value &&
    typeof value === "object" &&
    typeof value["#text"] === "string"
  ) {
    return value["#text"];
  }

  return "";
}

function parseRSS(
  xml: string,
  fallbackSource: string
): Candidate[] {

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const parsed = parser.parse(xml);

  const items = arr(
    parsed?.rss?.channel?.item
  );

  return items
    .map((item: any, index) => {

      const title =
        clean(item?.title);

      const link =
        clean(item?.link);

      const description =
        clean(item?.description);

      const source =
        clean(item?.source) ||
        fallbackSource;

      const pubDate =
        clean(item?.pubDate);

      let publishedAt: string | null = null;

      if (pubDate) {
        const d = new Date(pubDate);

        if (!Number.isNaN(d.getTime())) {
          publishedAt =
            d.toISOString();
        }
      }

      return {
        title,
        link,
        description,
        sourceName: source,
        publishedAt,
        rank: index,
      };

    })
    .filter(
      (item) =>
        item.title &&
        item.link
    );
}

async function fetchFeed(
  feed: FeedConfig
): Promise<Candidate[]> {

  const response =
    await fetch(feed.url, {
      headers: {
        "User-Agent":
          "BizBase Community News Bot/1.0",
        Accept:
          "application/rss+xml, application/xml, text/xml",
      },
    });

  if (!response.ok) {
    throw new Error(
      `${feed.name}: RSS ${response.status}`
    );
  }

  const xml =
    await response.text();

  return parseRSS(
    xml,
    feed.name
  );
}

function keywordScore(
  candidate: Candidate,
  keywords: string[]
): number {

  const content =
    `${candidate.title} ${candidate.description}`
      .toLowerCase();

  return keywords.reduce(
    (score, keyword) => {

      if (
        content.includes(
          keyword.toLowerCase()
        )
      ) {
        return score + 20;
      }

      return score;

    },
    0
  );
}

function freshnessScore(
  candidate: Candidate
): number {

  if (!candidate.publishedAt) {
    return 5;
  }

  const age =
    (
      Date.now() -
      new Date(
        candidate.publishedAt
      ).getTime()
    ) / 3600000;

  if (age < 6) return 40;
  if (age < 12) return 30;
  if (age < 24) return 20;
  if (age < 48) return 10;

  return 0;
}

async function alreadyPublished(
  communityId: string,
  sourceUrl: string
): Promise<boolean> {

  const { data, error } =
    await supabase
      .from(
        "community_news_items"
      )
      .select("id")
      .eq(
        "community_id",
        communityId
      )
      .eq(
        "source_url",
        sourceUrl
      )
      .limit(1);

  if (error) {
    throw error;
  }

  return Boolean(
    data &&
    data.length > 0
  );
}

function localDateIST(
  date = new Date()
): string {

  const local =
    new Date(
      date.getTime() +
      330 * 60000
    );

  return [
    local.getUTCFullYear(),
    String(
      local.getUTCMonth() + 1
    ).padStart(2, "0"),
    String(
      local.getUTCDate()
    ).padStart(2, "0"),
  ].join("-");
}

function localPartsIST(
  date = new Date()
) {

  const local =
    new Date(
      date.getTime() +
      330 * 60000
    );

  return {
    year:
      local.getUTCFullYear(),

    month:
      local.getUTCMonth(),

    day:
      local.getUTCDate(),

    minutes:
      local.getUTCHours() * 60 +
      local.getUTCMinutes(),
  };
}

function randomInt(
  min: number,
  max: number
): number {

  return Math.floor(
    Math.random() *
    (max - min + 1)
  ) + min;
}

/*
 * 1 post:
 * 09:00 - 21:00
 *
 * 2 posts:
 * morning + evening
 *
 * 3 posts:
 * morning + afternoon + evening
 */

function generateSlots(
  postsPerDay: number
): number[] {

  if (postsPerDay === 1) {

    return [
      randomInt(
        9 * 60,
        21 * 60
      ),
    ];
  }

  if (postsPerDay === 2) {

    return [
      randomInt(
        9 * 60,
        13 * 60
      ),

      randomInt(
        16 * 60,
        21 * 60
      ),
    ];
  }

  return [
    randomInt(
      9 * 60,
      12 * 60
    ),

    randomInt(
      13 * 60,
      17 * 60
    ),

    randomInt(
      18 * 60,
      21 * 60
    ),
  ];
}

function localSlotToUTC(
  dateString: string,
  minutes: number
): Date {

  const [
    year,
    month,
    day,
  ] =
    dateString
      .split("-")
      .map(Number);

  const utc =
    Date.UTC(
      year,
      month - 1,
      day,
      0,
      0,
      0
    );

  return new Date(
    utc +
    (
      minutes -
      330
    ) *
    60000
  );
}

async function prepareSchedule(
  config: any,
  now: Date
): Promise<any> {

  const today =
    localDateIST(now);

  if (
    config.schedule_date ===
      today &&
    Array.isArray(
      config.scheduled_slots
    ) &&
    config.scheduled_slots.length
  ) {
    return config;
  }

  const slots =
    generateSlots(
      config.posts_per_day
    ).sort(
      (a, b) => a - b
    );

  const firstUTC =
    localSlotToUTC(
      today,
      slots[0]
    );

  const {
    error
  } =
    await supabase
      .from(
        "community_content_automation"
      )
      .update({
        schedule_date:
          today,

        scheduled_slots:
          slots,

        completed_slots:
          [],

        next_run_at:
          firstUTC.toISOString(),

        last_error:
          null,
      })
      .eq(
        "id",
        config.id
      );

  if (error) {
    throw error;
  }

  return {
    ...config,

    schedule_date:
      today,

    scheduled_slots:
      slots,

    completed_slots:
      [],

    next_run_at:
      firstUTC.toISOString(),
  };
}

async function scheduleNext(
  config: any
): Promise<void> {

  const today =
    config.schedule_date;

  const completed =
    Array.isArray(
      config.completed_slots
    )
      ? config.completed_slots
      : [];

  const slots =
    Array.isArray(
      config.scheduled_slots
    )
      ? config.scheduled_slots
      : [];

  const remaining =
    slots
      .filter(
        (slot: number) =>
          !completed.includes(
            slot
          )
      )
      .sort(
        (a: number, b: number) =>
          a - b
      );

  if (remaining.length) {

    const next =
      localSlotToUTC(
        today,
        remaining[0]
      );

    await supabase
      .from(
        "community_content_automation"
      )
      .update({
        next_run_at:
          next.toISOString(),
      })
      .eq(
        "id",
        config.id
      );

    return;
  }

  /*
   * Today's slots completed.
   * Prepare tomorrow.
   */

  const tomorrow =
    new Date(
      Date.now() +
      86400000
    );

  const tomorrowDate =
    localDateIST(
      tomorrow
    );

  const tomorrowSlots =
    generateSlots(
      config.posts_per_day
    ).sort(
      (a, b) => a - b
    );

  const next =
    localSlotToUTC(
      tomorrowDate,
      tomorrowSlots[0]
    );

  await supabase
    .from(
      "community_content_automation"
    )
    .update({
      schedule_date:
        tomorrowDate,

      scheduled_slots:
        tomorrowSlots,

      completed_slots:
        [],

      next_run_at:
        next.toISOString(),

      last_error:
        null,
    })
    .eq(
      "id",
      config.id
    );
}

async function generateGeminiPost(
  community: any,
  config: any,
  candidate: Candidate
): Promise<string> {

  const prompt = `
You are the editorial writer for BizBase,
a professional work platform for founders,
entrepreneurs, investors, professionals,
students and builders.

Community:
${community.name}

Community topic:
${config.topic}

Source:
${candidate.sourceName}

Original headline:
${candidate.title}

Original description:
${candidate.description}

Original article URL:
${candidate.link}

Create ONE original, useful community post.

RULES:

1. Use ONLY facts present in the supplied source data.
2. Do not invent numbers, quotes, companies, funding amounts,
   dates or claims.
3. Do not copy the source article.
4. Rewrite it in original language.
5. Explain why this matters to professionals/founders/investors.
6. Keep it useful and concise.
7. 100-180 words maximum.
8. Professional but conversational.
9. No clickbait.
10. End with the original source link.
11. Clearly say "Source: ${candidate.sourceName}".
12. This is AI-assisted editorial content, so do not pretend
    that the community admin personally researched the story.

Return ONLY valid JSON:

{
  "headline": "...",
  "content": "...",
  "hashtags": ["#Startup", "#Business"]
}
`;

  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            contents: [
              {
                role:
                  "user",

                parts: [
                  {
                    text:
                      prompt,
                  },
                ],
              },
            ],

            generationConfig: {
              temperature:
                0.45,

              maxOutputTokens:
                700,

              responseMimeType:
                "application/json",
            },
          }),
      }
    );

  if (!response.ok) {
    throw new Error(
      `Gemini ${response.status}: ${await response.text()}`
    );
  }

  const data =
    await response.json();

  const raw =
    data?.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text;

  if (!raw) {
    throw new Error(
      "Gemini returned empty response"
    );
  }

  const result =
    JSON.parse(
      raw
        .replace(
          /^```json/i,
          ""
        )
        .replace(
          /```$/i,
          ""
        )
        .trim()
    );

  if (
    !result.content ||
    !result.headline
  ) {
    throw new Error(
      "Invalid Gemini content"
    );
  }

  const hashtags =
    Array.isArray(
      result.hashtags
    )
      ? result.hashtags
          .slice(0, 4)
          .join(" ")
      : "";

  return [
    `📰 ${String(
      result.headline
    ).trim()}`,

    "",

    String(
      result.content
    ).trim(),

    "",

    hashtags,

    "",

    `Source: ${candidate.sourceName}`,

    candidate.link,
  ]
    .filter(Boolean)
    .join("\n");
}

async function processAutomation(
  config: any
): Promise<any> {

  const now =
    new Date();

  let prepared =
    await prepareSchedule(
      config,
      now
    );

  /*
   * If the schedule is still in the future,
   * nothing should happen.
   */

  if (
    prepared.next_run_at &&
    new Date(
      prepared.next_run_at
    ).getTime() >
      now.getTime()
  ) {

    return {
      status:
        "waiting",
      community:
        prepared.communities.name,
      next_run_at:
        prepared.next_run_at,
    };
  }

  const community =
    prepared.communities;

  /*
   * IMPORTANT:
   * author must be the actual community owner/admin.
   */

  if (
    prepared.author_user_id !==
    community.user_id
  ) {

    throw new Error(
      "Automation author is not the community owner/admin"
    );
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("id,full_name")
      .eq(
        "id",
        prepared.author_user_id
      )
      .maybeSingle();

  if (!profile) {
    throw new Error(
      "Community admin profile does not exist"
    );
  }

  const feeds =
    Array.isArray(
      prepared.rss_feeds
    )
      ? prepared.rss_feeds as FeedConfig[]
      : [];

  if (!feeds.length) {
    throw new Error(
      "No RSS feeds configured"
    );
  }

  const keywords =
    Array.isArray(
      prepared.topic_keywords
    )
      ? prepared.topic_keywords
      : [];

  const candidates: Candidate[] =
    [];

  for (
    const feed of feeds
  ) {

    try {

      const items =
        await fetchFeed(
          feed
        );

      candidates.push(
        ...items
      );

    } catch (
      error
    ) {

      console.error(
        "RSS error",
        feed.name,
        error
      );
    }
  }

  const fresh =
    candidates
      .filter(
        (item) => {

          if (
            !item.publishedAt
          ) {
            return true;
          }

          const age =
            (
              Date.now() -
              new Date(
                item.publishedAt
              ).getTime()
            ) /
            3600000;

          return age <= 72;
        }
      )
      .filter(
        (item) => {

          if (
            !keywords.length
          ) {
            return true;
          }

          return (
            keywordScore(
              item,
              keywords
            ) > 0
          );
        }
      );

  const scored =
    fresh
      .map(
        (item) => ({
          item,

          score:
            freshnessScore(
              item
            ) +
            keywordScore(
              item,
              keywords
            ) +
            Math.max(
              0,
              20 -
                item.rank
            ),
        })
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  let selected:
    Candidate | null =
    null;

  for (
    const candidate
    of scored.map(
      (x) => x.item
    )
  ) {

    const duplicate =
      await alreadyPublished(
        community.id,
        candidate.link
      );

    if (!duplicate) {
      selected =
        candidate;

      break;
    }
  }

  if (!selected) {

    throw new Error(
      "No fresh unused RSS story found"
    );
  }

  const content =
    await generateGeminiPost(
      community,
      prepared,
      selected
    );

  /*
   * Publish under REAL community admin.
   */

  const { data: post, error: postError } =
    await supabase
      .from("posts")
      .insert({
        user_id:
          prepared.author_user_id,

        community_id:
          community.id,

        content,

        is_automated:
          true,

        automation_type:
          "community_ai_news",

        source_name:
          selected.sourceName,

        source_url:
          selected.link,

        community_topic:
          prepared.topic,
      })
      .select("id")
      .single();

  if (postError) {
    throw postError;
  }

  /*
   * Duplicate protection.
   */

  const { error: sourceError } =
    await supabase
      .from(
        "community_news_items"
      )
      .insert({
        community_id:
          community.id,

        source_url:
          selected.link,

        source_name:
          selected.sourceName,

        headline:
          selected.title,

        published_at:
          selected.publishedAt,

        post_id:
          post.id,
      });

  if (sourceError) {
    console.error(
      "Source log warning:",
      sourceError
    );
  }

  /*
   * Mark current random slot complete.
   */

  const completed =
    Array.isArray(
      prepared.completed_slots
    )
      ? [
          ...prepared.completed_slots,
          prepared.scheduled_slots
            .find(
              (slot: number) =>
                localSlotToUTC(
                  prepared.schedule_date,
                  slot
                ).getTime() <=
                Date.now()
            ),
        ]
      : [];

  await supabase
    .from(
      "community_content_automation"
    )
    .update({
      completed_slots:
        [
          ...new Set(
            completed
              .filter(
                Boolean
              )
          ),
        ],

      last_post_at:
        new Date().toISOString(),

      last_error:
        null,
    })
    .eq(
      "id",
      prepared.id
    );

  prepared.completed_slots =
    [
      ...new Set(
        completed.filter(
          Boolean
        )
      ),
    ];

  await scheduleNext(
    prepared
  );

  await supabase
    .from(
      "community_content_automation_logs"
    )
    .insert({
      automation_id:
        prepared.id,

      community_id:
        community.id,

      author_user_id:
        prepared.author_user_id,

      source_name:
        selected.sourceName,

      source_url:
        selected.link,

      source_headline:
        selected.title,

      post_id:
        post.id,

      status:
        "published",
    });

  return {
    status:
      "published",

    community:
      community.name,

    author:
      profile.full_name,

    post_id:
      post.id,

    source:
      selected.sourceName,

    headline:
      selected.title,
  };
}

Deno.serve(
  async (req) => {

    if (
      req.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers:
            CORS_HEADERS,
        }
      );
    }

    try {

      if (
        !AUTOMATION_SECRET
      ) {
        throw new Error(
          "COMMUNITY_AUTOPILOT_SECRET missing"
        );
      }

      const suppliedSecret =
        req.headers.get(
          "x-community-autopilot-secret"
        );

      if (
        suppliedSecret !==
        AUTOMATION_SECRET
      ) {

        return new Response(
          JSON.stringify({
            ok: false,
            error:
              "Unauthorized",
          }),
          {
            status: 401,
            headers:
              CORS_HEADERS,
          }
        );
      }

      if (
        !GEMINI_API_KEY
      ) {
        throw new Error(
          "GEMINI_API_KEY missing"
        );
      }

      /*
       * Get due automations.
       */

      const now =
        new Date().toISOString();

      const { data: dueByTime, error: dueError } =
        await supabase
          .from(
            "community_content_automation"
          )
          .select(`
            *,
            communities!inner(
              id,
              name,
              category,
              user_id
            )
          `)
          .eq(
            "enabled",
            true
          )
          .lte(
            "next_run_at",
            now
          )
          .limit(20);

      if (dueError) {
        throw dueError;
      }

      const { data: neverScheduled, error: nullError } =
        await supabase
          .from(
            "community_content_automation"
          )
          .select(`
            *,
            communities!inner(
              id,
              name,
              category,
              user_id
            )
          `)
          .eq(
            "enabled",
            true
          )
          .is(
            "next_run_at",
            null
          )
          .limit(20);

      if (nullError) {
        throw nullError;
      }

      const map =
        new Map();

      [
        ...(dueByTime || []),
        ...(neverScheduled || []),
      ].forEach(
        (item) =>
          map.set(
            item.id,
            item
          )
      );

      const results = [];

      for (
        const config of map.values()
      ) {

        /*
         * Simple lease.
         * Prevent duplicate execution if two
         * scheduler invocations overlap.
         */

        const oldNext =
          config.next_run_at;

        let claimQuery =
          supabase
            .from(
              "community_content_automation"
            )
            .update({
              next_run_at:
                new Date(
                  Date.now() +
                  10 * 60000
                ).toISOString(),
            })
            .eq(
              "id",
              config.id
            );

        if (oldNext) {

          claimQuery =
            claimQuery.eq(
              "next_run_at",
              oldNext
            );

        } else {

          claimQuery =
            claimQuery.is(
              "next_run_at",
              null
            );
        }

        const {
          data: claimed,
          error: claimError,
        } =
          await claimQuery
            .select("id")
            .maybeSingle();

        if (
          claimError ||
          !claimed
        ) {
          continue;
        }

        try {

          /*
           * Restore the original schedule object
           * and process it.
           */

          config.next_run_at =
            oldNext;

          const result =
            await processAutomation(
              config
            );

          results.push(
            result
          );

        } catch (
          error: any
        ) {

          const message =
            error?.message ||
            String(error);

          console.error(
            "Automation failed:",
            message
          );

          await supabase
            .from(
              "community_content_automation"
            )
            .update({
              next_run_at:
                new Date(
                  Date.now() +
                  15 * 60000
                ).toISOString(),

              last_error:
                message,
            })
            .eq(
              "id",
              config.id
            );

          await supabase
            .from(
              "community_content_automation_logs"
            )
            .insert({
              automation_id:
                config.id,

              community_id:
                config.community_id,

              author_user_id:
                config.author_user_id,

              status:
                "failed",

              error_message:
                message,
            });

          results.push({
            status:
              "failed",

            community:
              config.communities?.name,

            error:
              message,
          });
        }
      }

      return new Response(
        JSON.stringify({
          ok: true,
          results,
        }),
        {
          headers:
            CORS_HEADERS,
        }
      );

    } catch (
      error: any
    ) {

      console.error(
        "Community autopilot error:",
        error
      );

      return new Response(
        JSON.stringify({
          ok: false,
          error:
            error?.message ||
            String(error),
        }),
        {
          status: 500,
          headers:
            CORS_HEADERS,
        }
      );
    }
  }
);