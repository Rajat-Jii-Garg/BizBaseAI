import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PostScore {
  post_id: string;
  score: number;
  reasons: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const body = await req.json().catch(() => ({}));

    const limit = Number(body.limit ?? 30);
    const offset = Number(body.offset ?? 0);

    console.log(`Generating personalized feed for user ${user.id}`);

    // 1. Connections
    const { data: connections } = await supabaseClient
      .from("connections")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    const connectedUserIds = new Set<string>();

    connections?.forEach((conn) => {
      if (conn.requester_id !== user.id) {
        connectedUserIds.add(conn.requester_id);
      }

      if (conn.addressee_id !== user.id) {
        connectedUserIds.add(conn.addressee_id);
      }
    });

    // 2. Follows
    const { data: follows } = await supabaseClient
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followedUserIds = new Set<string>(
      follows?.map((f) => f.following_id) ?? []
    );

    // 3. User interests
    const { data: interests } = await supabaseClient
      .from("user_interests")
      .select("interest_type, interest_value, score")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(50);

    const interestMap = new Map<string, number>();

    interests?.forEach((interest) => {
      interestMap.set(
        `${interest.interest_type}:${interest.interest_value}`,
        Number(interest.score ?? 0)
      );
    });

    // 4. Creator affinity
    const { data: creatorAffinity } = await supabaseClient
      .from("user_creator_affinity")
      .select("creator_id, affinity_score")
      .eq("user_id", user.id)
      .order("affinity_score", { ascending: false })
      .limit(30);

    const affinityMap = new Map<string, number>();

    creatorAffinity?.forEach((creator) => {
      affinityMap.set(
        creator.creator_id,
        Number(creator.affinity_score ?? 0)
      );
    });

    // 5. Recently interacted posts
    const last24Hours = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: recentInteractions } = await supabaseClient
      .from("user_content_interactions")
      .select("post_id")
      .eq("user_id", user.id)
      .gte("created_at", last24Hours);

    const recentlyViewedPosts = new Set<string>(
      recentInteractions?.map((interaction) => interaction.post_id) ?? []
    );

    // 6. Candidate posts
    const { data: candidatePosts, error: postsError } =
      await supabaseClient
        .from("posts")
        .select(`
          id,
          user_id,
          content,
          image_url,
          likes_count,
          comments_count,
          shares_count,
          reposts_count,
          created_at,
          updated_at,
          community_id,
          is_automated,
          automation_type,
          source_name,
          source_url,
          community_topic
        `)
        .order("created_at", { ascending: false })
        .limit(1000);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      throw postsError;
    }

    if (!candidatePosts || candidatePosts.length === 0) {
      return new Response(
        JSON.stringify({
          posts: [],
          hasMore: false,
          total: 0,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 7. Score posts
    const scoredPosts: PostScore[] = candidatePosts.map((post) => {
      let score = 0;
      const reasons: string[] = [];

      const hoursOld =
        (Date.now() - new Date(post.created_at).getTime()) /
        (1000 * 60 * 60);

      // Recency
      const recencyScore = Math.max(0, 10 - hoursOld / 24);

      score += recencyScore;

      // Connections
      if (connectedUserIds.has(post.user_id)) {
        score += 15;
        reasons.push("connection");
      }

      // Following
      if (followedUserIds.has(post.user_id)) {
        score += 12;
        reasons.push("following");
      }

      // Creator affinity
      const affinity = affinityMap.get(post.user_id);

      if (affinity) {
        score += affinity * 3;
        reasons.push("frequent_creator");
      }

      // Hashtags
      const hashtags = post.content?.match(/#(\w+)/g) ?? [];

      hashtags.forEach((tag: string) => {
        const cleanTag = tag.substring(1).toLowerCase();

        const tagScore = interestMap.get(
          `hashtag:${cleanTag}`
        );

        if (tagScore) {
          score += tagScore * 2;
          reasons.push("interest_match");
        }
      });

      // Engagement
      const engagementScore =
        (post.likes_count ?? 0) * 0.5 +
        (post.comments_count ?? 0) * 1 +
        (post.shares_count ?? 0) * 1.5 +
        (post.reposts_count ?? 0) * 2;

      score += Math.min(engagementScore, 20);

      // Recently viewed
      if (recentlyViewedPosts.has(post.id)) {
        score -= 30;
        reasons.push("recently_viewed");
      }

      // Media
      if (post.image_url) {
        score += 3;
        reasons.push("has_media");
      }

      // Discovery
      if (
        !connectedUserIds.has(post.user_id) &&
        !followedUserIds.has(post.user_id)
      ) {
        if (Math.random() < 0.3) {
          score += 8;
          reasons.push("discovery");
        }
      }

      // Own posts
      if (post.user_id === user.id) {
        score += hoursOld < 48 ? 60 : 10;
        reasons.push("your_post");
      }

      return {
        post_id: post.id,
        score,
        reasons: [...new Set(reasons)],
      };
    });

    // 8. Sort
    scoredPosts.sort((a, b) => b.score - a.score);

    const paginatedPostIds = scoredPosts
      .slice(offset, offset + limit)
      .map((post) => post.post_id);

    if (paginatedPostIds.length === 0) {
      return new Response(
        JSON.stringify({
          posts: [],
          hasMore: false,
          total: scoredPosts.length,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 9. Fetch full posts
    const { data: fullPosts, error: fullPostsError } =
      await supabaseClient
        .from("posts")
        .select("*")
        .in("id", paginatedPostIds);

    if (fullPostsError) {
      console.error(
        "Error fetching full posts:",
        fullPostsError
      );

      throw fullPostsError;
    }

    // 10. Profiles
    const userIds = [
      ...new Set(
        (fullPosts ?? []).map((post) => post.user_id)
      ),
    ];

    const { data: profiles } = await supabaseClient
      .from("profiles")
      .select(
        "id, full_name, avatar_url, current_position, company_name, username"
      )
      .in("id", userIds);

    const profilesMap = new Map(
      (profiles ?? []).map((profile) => [
        profile.id,
        profile,
      ])
    );

    // 11. User likes
    const { data: userLikes } = await supabaseClient
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", paginatedPostIds);

    const likedPosts = new Set<string>(
      userLikes?.map((like) => like.post_id) ?? []
    );

    // 12. User reposts
    const { data: userReposts } = await supabaseClient
      .from("post_reposts")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", paginatedPostIds);

    const repostedPosts = new Set<string>(
      userReposts?.map((repost) => repost.post_id) ?? []
    );

    // 13. Score map
    const scoreMap = new Map(
      scoredPosts.map((post) => [
        post.post_id,
        post,
      ])
    );

    // 14. Final response
    const enrichedPosts = paginatedPostIds
      .map((postId) => {
        const post = fullPosts?.find(
          (item) => item.id === postId
        );

        if (!post) {
          return null;
        }

        const scoreInfo = scoreMap.get(postId);

        return {
          ...post,

          profiles:
            profilesMap.get(post.user_id) ?? {
              full_name: "Unknown User",
              avatar_url: null,
              current_position: null,
              company_name: null,
              username: null,
            },

          user_has_liked: likedPosts.has(post.id),

          user_has_reposted: repostedPosts.has(
            post.id
          ),

          feed_reasons:
            scoreInfo?.reasons ?? [],
        };
      })
      .filter(Boolean);

    console.log(
      `Returning ${enrichedPosts.length} personalized posts for user ${user.id}`
    );

    return new Response(
      JSON.stringify({
        posts: enrichedPosts,
        hasMore:
          scoredPosts.length > offset + limit,
        total: scoredPosts.length,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Personalized feed error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to generate feed";

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});