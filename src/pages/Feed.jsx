import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import TrackedPostCard from '@/components/TrackedPostCard';
import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { usePosts } from '@/hooks/usePosts';
import SEOHead from '@/components/SEOHead';

const Feed = () => {
  const {
    posts,
    loading,
    refreshing,
    hasMore,
    refreshFeed,
    loadMore,
    refetch
  } = usePersonalizedFeed();

  const { editPost, deletePost } = usePosts();

  return (
    <DashboardLayout>
      <SEOHead title="Feed" description="Your personalized professional feed on BizBase AI." path="/feed" />
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">

        <div className="space-y-6">
          {loading && posts.length === 0 ? (
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
            <>
              {posts.map((post) => (
                <TrackedPostCard
                  key={post.id}
                  post={post}
                  onEngagementUpdate={refetch}
                  onEdit={editPost}
                  onDelete={deletePost}
                />
              ))}
              
              {hasMore && (
                <div className="text-center py-6">
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading more posts...</span>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={loadMore}>
                      Load More Posts
                    </Button>
                  )}
                </div>
              )}
              
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">You've seen all the latest posts!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Feed;
