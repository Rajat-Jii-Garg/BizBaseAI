
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, MessageSquare, Share2, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedPostCard from '@/components/EnhancedPostCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Feed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllPosts();
      setupRealTimeSubscription();
    }
  }, [user]);

  const fetchAllPosts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            avatar_url,
            current_position,
            company_name
          ),
          post_likes!left (
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedPosts = posts?.map(post => ({
        ...post,
        user_has_liked: post.post_likes?.some((like: any) => like.user_id === user.id) || false
      })) || [];

      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Real-time post update:', payload);
          fetchAllPosts(); // Refresh posts on any change
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        (payload) => {
          console.log('Real-time like update:', payload);
          fetchAllPosts(); // Refresh posts on like changes
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments'
        },
        (payload) => {
          console.log('Real-time comment update:', payload);
          fetchAllPosts(); // Refresh posts on comment changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Professional Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Your Network</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Latest Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>Trending Content</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your personalized feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                <p className="text-gray-600">Start following professionals to see their updates in your feed.</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <EnhancedPostCard
                key={post.id}
                post={post}
                onEngagementUpdate={fetchAllPosts}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Feed;
