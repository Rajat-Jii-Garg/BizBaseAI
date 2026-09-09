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
        if (!cancelled) setFailed(true);
        return;
      }

      try {
        /*
         * 1. Find the post.
         */
        const { data: post, error: postError } = await supabase
          .from("posts")
          .select("id, user_id")
          .eq("id", postId)
          .maybeSingle();

        if (postError) {
          console.error("Post redirect query failed:", postError);

          if (!cancelled) setFailed(true);
          return;
        }

        if (!post?.id || !post?.user_id) {
          if (!cancelled) setFailed(true);
          return;
        }

        /*
         * 2. Find actual post owner.
         */
        const { data: owner, error: ownerError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", post.user_id)
          .maybeSingle();

        if (ownerError) {
          console.error("Post owner query failed:", ownerError);

          if (!cancelled) setFailed(true);
          return;
        }

        if (!owner?.username) {
          if (!cancelled) setFailed(true);
          return;
        }

        /*
         * 3. Build canonical URL.
         */
        const canonicalUrl = `/${encodeURIComponent(owner.username)}/post/${encodeURIComponent(post.id)}`;

        if (!cancelled) {
          setTarget(canonicalUrl);
        }
      } catch (error) {
        console.error("Unexpected post redirect error:", error);

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
