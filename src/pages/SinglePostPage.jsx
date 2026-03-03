import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const loginTimerRef = useRef(null);

  // Fetch Post - separate queries to avoid FK join issues
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        // Fetch post first
        const { data: postData, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .maybeSingle();

        if (error || !postData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Fetch profile separately
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, current_position, is_verified")
          .eq("id", postData.user_id)
          .maybeSingle();

        if (!profileData || profileData.username?.toLowerCase() !== username?.toLowerCase()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        postData.profiles = profileData;

        // Check if current user has liked/reposted
        if (user) {
          const [likeRes, repostRes] = await Promise.all([
            supabase.from("post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle(),
            supabase.from("post_reposts").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle(),
          ]);
          postData.user_has_liked = !!likeRes.data;
          postData.user_has_reposted = !!repostRes.data;
        }

        setPost(postData);
      } catch (err) {
        console.error("Error fetching post:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (postId && username) fetchPost();
  }, [username, postId, user?.id]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const userIds = [...new Set(data?.map((c) => c.user_id) || [])];
      if (userIds.length === 0) {
        setComments([]);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, current_position")
        .in("id", userIds);

      setComments(
        data?.map((comment) => ({
          ...comment,
          profiles: profiles?.find((p) => p.id === comment.user_id),
        })) || []
      );
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, fetchComments]);

  // Login popup cycle for non-logged users
  const startLoginTimer = useCallback(() => {
    if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
    loginTimerRef.current = setTimeout(() => {
      setShowLoginModal(true);
    }, 30000);
  }, []);

  useEffect(() => {
    if (!user) startLoginTimer();
    return () => {
      if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
    };
  }, [user, startLoginTimer]);

  const handleCloseLogin = () => {
    setShowLoginModal(false);
    startLoginTimer();
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user || submitting) return;
    setSubmitting(true);
    try {
      await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        content: commentText.trim(),
      });
      setCommentText("");
      await fetchComments();
      setPost((prev) =>
        prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : prev
      );
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (notFound) return <NotFound />;

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
          <EnhancedPostCard post={post} onEngagementUpdate={fetchComments} />

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
                    onChange={(e) => setCommentText(e.target.value)}
                    className="border-0 bg-transparent h-8 text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
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
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Log in to share your feedback.
              </p>
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