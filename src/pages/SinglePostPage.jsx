import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/PostCard";
import LoginModal from "@/components/LoginModal"; // create this

const SinglePostPage = () => {
  const { username, postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch Post
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);

      // Validate username
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (!profileData) {
        navigate("/404");
        return;
      }

      // Fetch post
      const { data: postData } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("id", postId)
        .single();

      if (!postData) {
        navigate("/404");
        return;
      }

      setPost(postData);
      setLoading(false);
    };

    fetchPost();
  }, [username, postId]);

  // 🔐 Auto Login Popup after 30 sec if not logged in
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowLoginModal(true);
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [user]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!post) return null;

  return (
    <>
      <div className={`max-w-2xl mx-auto py-6 ${showLoginModal ? "blur-sm pointer-events-none" : ""}`}>
        <PostCard post={post} />
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

export default SinglePostPage;