import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NotFound from "@/pages/NotFound";

const PostRedirect = () => {
  const { postId } = useParams();

  const [target, setTarget] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolvePost = async () => {
      if (!postId) {
        setFailed(true);
        return;
      }

      try {
        /*
         * Step 1:
         * Find the actual post.
         */
        const { data: post, error: postError } = await supabase
          .from("posts")
          .select("id, user_id")
          .eq("id", postId)
          .maybeSingle();

        if (postError) {
          console.error("Post resolution error:", postError);

          if (!cancelled) {
            setFailed(true);
          }

          return;
        }

        if (!post?.user_id) {
          if (!cancelled) {
            setFailed(true);
          }

          return;
        }

        /*
         * Step 2:
         * Find the actual owner username.
         */
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", post.user_id)
          .maybeSingle();

        if (profileError) {
          console.error("Post owner resolution error:", profileError);

          if (!cancelled) {
            setFailed(true);
          }

          return;
        }

        if (!profile?.username) {
          if (!cancelled) {
            setFailed(true);
          }

          return;
        }

        /*
         * Step 3:
         * Build canonical public post URL.
         */
        const canonicalUrl = `/${encodeURIComponent(profile.username)}/post/${post.id}`;

        if (!cancelled) {
          setTarget(canonicalUrl);
        }
      } catch (error) {
        console.error("Unexpected error resolving post:", error);

        if (!cancelled) {
          setFailed(true);
        }
      }
    };

    resolvePost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (failed) {
    return <NotFound />;
  }

  if (target) {
    return <Navigate to={target} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default PostRedirect;
