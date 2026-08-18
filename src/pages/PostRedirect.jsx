import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import NotFound from '@/pages/NotFound';

// Resolves /post/:postId -> /:username/post/:postId (canonical public URL)
const PostRedirect = () => {
  const { postId } = useParams();
  const [target, setTarget] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const resolve = async () => {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .maybeSingle();

      if (!post) return setFailed(true);

      const { data: prof } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', post.user_id)
        .maybeSingle();

      if (prof?.username) setTarget(`/${prof.username}/post/${postId}`);
      else setFailed(true);
    };
    resolve();
  }, [postId]);

  if (failed) return <NotFound />;
  if (target) return <Navigate to={target} replace />;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default PostRedirect;
