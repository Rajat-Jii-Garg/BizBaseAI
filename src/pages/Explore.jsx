import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Heart, MessageSquare, Share2, Loader2, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [postsRes, hashtagsRes] = await Promise.all([
        supabase
          .from('posts')
          .select('id, content, image_url, created_at, likes_count, comments_count, shares_count, user_id')
          .order('likes_count', { ascending: false })
          .limit(20),
        supabase
          .from('hashtags')
          .select('name, usage_count')
          .order('usage_count', { ascending: false })
          .limit(10),
      ]);

      const postsData = postsRes.data || [];
      // Fetch profiles separately
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      let profiles = [];
      if (userIds.length > 0) {
        const { data } = await supabase.from('profiles').select('id, full_name, avatar_url, username, current_position').in('id', userIds);
        profiles = data || [];
      }

      const enriched = postsData.map(post => ({
        ...post,
        author: profiles.find(p => p.id === post.user_id) || {},
      }));

      setPosts(enriched);
      setTrending(hashtagsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BizBase</span>
          </Link>
          <Button onClick={() => navigate('/login')} size="sm">
            <LogIn className="w-4 h-4 mr-1" /> Join BizBase
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore BizBase</h1>
          <p className="text-muted-foreground">Discover trending professional content and join the community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Trending Posts
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              </div>
            ) : posts.map(post => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => post.author?.username && navigate(`/${post.author.username}/post/${post.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={post.author?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">{post.author?.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-foreground">{post.author?.full_name || 'BizBase User'}</p>
                      <p className="text-xs text-muted-foreground">{post.author?.current_position || ''} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-3 line-clamp-4 whitespace-pre-wrap">{post.content}</p>
                  {post.image_url && <img src={post.image_url} alt="" className="rounded-lg w-full max-h-64 object-cover mb-3" />}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes_count || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.comments_count || 0}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> {post.shares_count || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">🔥 Trending Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {trending.map(tag => (
                    <Badge key={tag.name} variant="secondary" className="text-xs">#{tag.name} ({tag.usage_count})</Badge>
                  ))}
                  {trending.length === 0 && <p className="text-xs text-muted-foreground">No trending topics yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold text-lg mb-1">Join BizBase</h3>
                <p className="text-sm opacity-90 mb-4">Build your professional network, earn BizCoins, and grow your career.</p>
                <Button variant="secondary" className="w-full" onClick={() => navigate('/signup')}>
                  Sign Up Free
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SEO Footer */}
      <footer className="border-t border-border mt-12 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} BizBase — Professional Networking Platform</p>
        <p className="mt-1">Connect, grow, and succeed with BizBase.</p>
      </footer>
    </div>
  );
};

export default Explore;
