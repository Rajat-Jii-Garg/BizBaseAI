import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PostScore {
  post_id: string;
  score: number;
  reasons: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { limit = 30, offset = 0 } = await req.json().catch(() => ({}));

    console.log(`Generating personalized feed for user ${user.id}`);

    // 1. Get user's connections (people they follow)
    const { data: connections } = await supabaseClient
      .from("connections")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    const connectedUserIds = new Set<string>();
    connections?.forEach((conn) => {
      if (conn.requester_id !== user.id) connectedUserIds.add(conn.requester_id);
      if (conn.addressee_id !== user.id) connectedUserIds.add(conn.addressee_id);
    });

    // 2. Get user's follows
    const { data: follows } = await supabaseClient
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followedUserIds = new Set(follows?.map((f) => f.following_id) || []);

    // 3. Get user's interests (hashtags, topics)
    const { data: interests } = await supabaseClient
      .from("user_interests")
      .select("interest_type, interest_value, score")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(50);

    const interestMap = new Map<string, number>();
    interests?.forEach((i) => {
      interestMap.set(`${i.interest_type}:${i.interest_value}`, i.score);
    });

    // 4. Get creator affinity
    const { data: creatorAffinity } = await supabaseClient
      .from("user_creator_affinity")
      .select("creator_id, affinity_score")
      .eq("user_id", user.id)
      .order("affinity_score", { ascending: false })
      .limit(30);

    const affinityMap = new Map<string, number>();
    creatorAffinity?.forEach((c) => {
      affinityMap.set(c.creator_id, c.affinity_score);
    });

    // 5. Get recently interacted posts to avoid showing again
    const { data: recentInteractions } = await supabaseClient
      .from("user_content_interactions")
      .select("post_id")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const recentlyViewedPosts = new Set(recentInteractions?.map((i) => i.post_id) || []);

    // 6. Fetch candidate posts (last 7 days, more than limit to allow scoring)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: candidatePosts, error: postsError } = await supabaseClient
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
        updated_at
      `)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(200);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      throw postsError;
    }

    if (!candidatePosts || candidatePosts.length === 0) {
      return new Response(JSON.stringify({ posts: [], hasMore: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Score each post based on multiple factors
    const scoredPosts: PostScore[] = candidatePosts.map((post) => {
      let score = 0;
      const reasons: string[] = [];

      // Base recency score (decay over time)
      const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 10 - hoursOld / 24); // Decay over 10 days
      score += recencyScore;

      // Connection boost (posts from connections)
      if (connectedUserIds.has(post.user_id)) {
        score += 15;
        reasons.push("connection");
      }

      // Following boost
      if (followedUserIds.has(post.user_id)) {
        score += 12;
        reasons.push("following");
      }

      // Creator affinity boost
      const affinity = affinityMap.get(post.user_id);
      if (affinity) {
        score += affinity * 3;
        reasons.push("frequent_creator");
      }

      // Interest matching (hashtags)
      const hashtags = post.content?.match(/#(\w+)/g) || [];
      hashtags.forEach((tag: string) => {
        const tagScore = interestMap.get(`hashtag:${tag.substring(1).toLowerCase()}`);
        if (tagScore) {
          score += tagScore * 2;
          reasons.push("interest_match");
        }
      });

      // Engagement boost (popular posts)
      const engagementScore = 
        (post.likes_count || 0) * 0.5 +
        (post.comments_count || 0) * 1 +
        (post.shares_count || 0) * 1.5 +
        (post.reposts_count || 0) * 2;
      score += Math.min(engagementScore, 20); // Cap at 20

      // Penalize already viewed posts
      if (recentlyViewedPosts.has(post.id)) {
        score -= 30;
        reasons.push("recently_viewed");
      }

      // Boost posts with media
      if (post.image_url) {
        score += 3;
        reasons.push("has_media");
      }

      // Discovery boost (random factor for new content discovery)
      // 30% chance to boost non-connection posts for discovery
      if (!connectedUserIds.has(post.user_id) && !followedUserIds.has(post.user_id)) {
        if (Math.random() < 0.3) {
          score += 8;
          reasons.push("discovery");
        }
      }

      // Don't show user's own posts at top
      if (post.user_id === user.id) {
        score -= 5;
      }

      return {
        post_id: post.id,
        score,
        reasons: [...new Set(reasons)],
      };
    });

    // 8. Sort by score and apply pagination
    scoredPosts.sort((a, b) => b.score - a.score);
    const paginatedPostIds = scoredPosts
      .slice(offset, offset + limit)
      .map((p) => p.post_id);

    // 9. Fetch full post data with profiles
    const { data: fullPosts, error: fullPostsError } = await supabaseClient
      .from("posts")
      .select("*")
      .in("id", paginatedPostIds);

    if (fullPostsError) {
      console.error("Error fetching full posts:", fullPostsError);
      throw fullPostsError;
    }

    // Get profiles
    const userIds = [...new Set(fullPosts?.map((p) => p.user_id) || [])];
    const { data: profiles } = await supabaseClient
      .from("profiles")
      .select("id, full_name, avatar_url, current_position, company_name, username")
      .in("id", userIds);

    const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Get user's likes and reposts
    const { data: userLikes } = await supabaseClient
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", paginatedPostIds);

    const likedPosts = new Set(userLikes?.map((l) => l.post_id) || []);

    const { data: userReposts } = await supabaseClient
      .from("post_reposts")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", paginatedPostIds);

    const repostedPosts = new Set(userReposts?.map((r) => r.post_id) || []);

    // 10. Build final response maintaining score order
    const scoreMap = new Map(scoredPosts.map((p) => [p.post_id, p]));
    
    const enrichedPosts = paginatedPostIds
      .map((postId) => {
        const post = fullPosts?.find((p) => p.id === postId);
        if (!post) return null;
        
        const scoreInfo = scoreMap.get(postId);
        return {
          ...post,
          profiles: profilesMap.get(post.user_id) || {
            full_name: "Unknown User",
            avatar_url: null,
            current_position: null,
            company_name: null,
          },
          user_has_liked: likedPosts.has(post.id),
          user_has_reposted: repostedPosts.has(post.id),
          feed_reasons: scoreInfo?.reasons || [],
        };
      })
      .filter(Boolean);

    console.log(`Returning ${enrichedPosts.length} personalized posts for user ${user.id}`);

    return new Response(
      JSON.stringify({
        posts: enrichedPosts,
        hasMore: scoredPosts.length > offset + limit,
        total: scoredPosts.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Personalized feed error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate feed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
