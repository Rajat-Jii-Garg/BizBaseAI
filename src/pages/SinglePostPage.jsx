import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import NotFound from "@/pages/NotFound";
import EnhancedPostCard from "@/components/EnhancedPostCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import CommentItem from "@/components/CommentItem";

const SinglePostPage = () => {
  const { username, postId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // If the URL contains the wrong username,
  // this stores the correct canonical URL.
  const [canonicalPath, setCanonicalPath] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const loginTimerRef = useRef(null);

  /*
   * ============================================================
   * FETCH POST
   * ============================================================
   *
   * URL:
   *
   * /:username/post/:postId
   *
   * IMPORTANT:
   *
   * postId is the source of truth.
   * The username from the URL is only validated against
   * the actual post owner.
   *
   * This prevents:
   *
   * /actor/post/postId
   *
   * from causing a false 404 when actor != owner.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      if (!postId || !username) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setNotFound(false);
      setCanonicalPath(null);
      try {
        /*
         * --------------------------------------------------------
         * 1. Fetch the actual post
         * --------------------------------------------------------
         */
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .maybeSingle();

        if (postError) {
          console.error("Error loading post:", postError);
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }
        if (!postData) {
          console.warn("Post not found:", postId);
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        /*
         * --------------------------------------------------------
         * 2. Fetch the ACTUAL POST OWNER
         * --------------------------------------------------------
         */
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(
            "id, username, full_name, avatar_url, current_position, is_verified",
          )
          .eq("id", postData.user_id)
          .maybeSingle();

        if (profileError) {
          console.error("Error loading post owner:", profileError);
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }
        if (!profileData?.username) {
          console.warn(
            "Post owner profile/username not found:",
            postData.user_id,
          );
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        /*
         * Attach owner profile to post.
         */
        postData.profiles = profileData;
        /*
         * --------------------------------------------------------
         * 3. BUILD ONE SINGLE CANONICAL URL
         * --------------------------------------------------------
         *
         * DO NOT declare canonicalUrl anywhere else in this block.
         */
        const canonicalUrl = `/${encodeURIComponent(
          profileData.username,
        )}/post/${encodeURIComponent(postData.id)}`;
        /*
         * --------------------------------------------------------
         * 4. REPAIR WRONG USERNAME URL
         * --------------------------------------------------------
         *
         * Example:
         *
         * /manangarg11/post/POST_ID
         *
         * but actual owner:
         *
         * /rajatgarg/post/POST_ID
         *
         * We redirect automatically instead of showing 404.
         */
        const requestedUsername = String(username || "")
          .trim()
          .toLowerCase();

        const actualOwnerUsername = String(profileData.username || "")
          .trim()
          .toLowerCase();

        if (requestedUsername !== actualOwnerUsername) {
          if (!cancelled) {
            setCanonicalPath(canonicalUrl);
            setLoading(false);
          }

          return;
        }

        /*
         * --------------------------------------------------------
         * 5. CHECK CURRENT USER ENGAGEMENT
         * --------------------------------------------------------
         */
        if (user?.id) {
          const [likeRes, repostRes] = await Promise.all([
            supabase
              .from("post_likes")
              .select("id")
              .eq("post_id", postData.id)
              .eq("user_id", user.id)
              .maybeSingle(),

            supabase
              .from("post_reposts")
              .select("id")
              .eq("post_id", postData.id)
              .eq("user_id", user.id)
              .maybeSingle(),
          ]);

          postData.user_has_liked = !!likeRes.data;

          postData.user_has_reposted = !!repostRes.data;
        } else {
          postData.user_has_liked = false;
          postData.user_has_reposted = false;
        }

        /*
         * --------------------------------------------------------
         * 6. SET POST
         * --------------------------------------------------------
         */
        if (!cancelled) {
          setPost(postData);
        }
      } catch (error) {
        console.error("Unexpected error fetching post:", error);

        if (!cancelled) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [username, postId, user?.id]);

  /*
   * ============================================================
   * FETCH COMMENTS
   * ============================================================
   */
  const fetchComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      return;
    }

    setLoadingComments(true);

    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const userIds = [
        ...new Set(
          (data || []).map((comment) => comment.user_id).filter(Boolean),
        ),
      ];

      if (userIds.length === 0) {
        setComments([]);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, current_position")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error loading comment profiles:", profilesError);
      }

      const profileList = profiles || [];

      setComments(
        (data || []).map((comment) => ({
          ...comment,
          profiles:
            profileList.find(
              (profileItem) => profileItem.id === comment.user_id,
            ) || null,
        })),
      );
    } catch (error) {
      console.error("Error fetching comments:", error);

      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /*
   * ============================================================
   * LOGIN POPUP TIMER
   * ============================================================
   */
  const startLoginTimer = useCallback(() => {
    if (loginTimerRef.current) {
      clearTimeout(loginTimerRef.current);
    }

    loginTimerRef.current = setTimeout(() => {
      setShowLoginModal(true);
    }, 30000);
  }, []);

  useEffect(() => {
    if (!user) {
      startLoginTimer();
    }

    return () => {
      if (loginTimerRef.current) {
        clearTimeout(loginTimerRef.current);
      }
    };
  }, [user, startLoginTimer]);

  const handleCloseLogin = () => {
    setShowLoginModal(false);
    startLoginTimer();
  };

  /*
   * ============================================================
   * SUBMIT COMMENT
   * ============================================================
   */
  const handleSubmitComment = async () => {
    const content = commentText.trim();

    if (!content || !user?.id || !postId || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        content,
      });

      if (error) {
        throw error;
      }

      setCommentText("");

      await fetchComments();

      /*
       * Update displayed comment count
       * without trusting a client-side DB counter.
       */
      setPost((previousPost) =>
        previousPost
          ? {
              ...previousPost,
              comments_count: (previousPost.comments_count || 0) + 1,
            }
          : previousPost,
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  /*
   * ============================================================
   * CANONICAL REDIRECT
   * ============================================================
   *
   * This MUST happen before notFound.
   */
  if (canonicalPath) {
    return <Navigate to={canonicalPath} replace />;
  }

  /*
   * ============================================================
   * NOT FOUND
   * ============================================================
   */
  if (notFound || !post) {
    return <NotFound />;
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */
  return (
    <>
      <div
        className={`min-h-screen bg-background ${
          showLoginModal ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-2xl mx-auto flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
              Post
            </h1>
          </div>
        </div>

        {/* Post Card */}
        <div className="max-w-2xl mx-auto">
          <EnhancedPostCard
            post={post}
            onEngagementUpdate={() => {
              fetchComments();
            }}
          />

          {/* Comments Section */}
          <div className="bg-card border-t border-border/50 px-3 sm:px-6 py-4">
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-4">
              Feedback ({comments.length})
            </h3>

            {/* Comment Input */}
            {user ? (
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border/30">
                  <AvatarImage src={profile?.avatar_url} />

                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary text-xs font-semibold">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 flex items-center gap-1.5 bg-muted/40 rounded-full px-3 py-1.5 border border-border/50 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <Input
                    placeholder="Write your feedback..."
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    className="border-0 bg-transparent h-8 text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 shrink-0 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full disabled:opacity-40"
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || submitting}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Log in to upvote, share feedback and connect.
                </p>

                <Button size="sm" onClick={() => setShowLoginModal(true)}>
                  Log in to continue
                </Button>
              </div>
            )}

            {/* Comments List */}
            {loadingComments ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    onUpdate={fetchComments}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                No feedback yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={handleCloseLogin} />}
    </>
  );
};

export default SinglePostPage;
