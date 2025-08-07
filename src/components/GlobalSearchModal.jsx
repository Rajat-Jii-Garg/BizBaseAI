
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User, FileText, Hash, MessageCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const GlobalSearchModal = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    users: [],
    posts: [],
    hashtags: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults({ users: [], posts: [], hashtags: [] });
    }
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setLoading(true);
      
      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, current_position, avatar_url, company_name')
        .ilike('full_name', `%${searchQuery}%`)
        .limit(5);

      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id, content, created_at, likes_count, comments_count,
          profiles!posts_user_id_fkey (full_name, avatar_url)
        `)
        .ilike('content', `%${searchQuery}%`)
        .limit(5);

      // Search hashtags
      const { data: hashtags } = await supabase
        .from('hashtags')
        .select('name, usage_count')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      setSearchResults({
        users: users || [],
        posts: posts || [],
        hashtags: hashtags || []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user-profile?user=${userId}`);
    onClose();
  };

  const handlePostClick = (postId) => {
    navigate(`/dashboard`); // Navigate to feed and scroll to post
    onClose();
  };

  const handleHashtagClick = (hashtag) => {
    navigate(`/dashboard?hashtag=${hashtag}`);
    onClose();
  };

  const clearAndClose = () => {
    setSearchQuery('');
    setSearchResults({ users: [], posts: [], hashtags: [] });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={clearAndClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Everything
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search people, posts, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {searchQuery.length > 2 && !loading && (
            <div className="space-y-6">
              {/* Users */}
              {searchResults.users.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <User className="w-4 h-4" />
                    People
                  </h3>
                  <div className="space-y-2">
                    {searchResults.users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserClick(user.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-gray-600">
                            {user.current_position} {user.company_name && `at ${user.company_name}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {searchResults.posts.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4" />
                    Posts
                  </h3>
                  <div className="space-y-2">
                    {searchResults.posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.profiles?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {post.profiles?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{post.profiles?.full_name}</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {post.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{post.likes_count || 0} likes</span>
                          <span>{post.comments_count || 0} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {searchResults.hashtags.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <Hash className="w-4 h-4" />
                    Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.hashtags.map((hashtag) => (
                      <Badge
                        key={hashtag.name}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                        onClick={() => handleHashtagClick(hashtag.name)}
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {hashtag.name}
                        <span className="ml-2 text-xs">({hashtag.usage_count})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {searchResults.users.length === 0 && 
               searchResults.posts.length === 0 && 
               searchResults.hashtags.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm">Try different keywords or check spelling</p>
                </div>
              )}
            </div>
          )}

          {searchQuery.length <= 2 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Start typing to search people, posts, and hashtags</p>
              <p className="text-sm">Use Ctrl+K to quickly open search</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearchModal;
