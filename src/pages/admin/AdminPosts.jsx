import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader2, RefreshCw, Heart, MessageCircle, Share2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminPosts = () => {
  const { fetchPosts, deletePost } = useAdmin();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPosts = async (s = '') => {
    setLoading(true);
    const data = await fetchPosts(s);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const handleSearch = (e) => { e.preventDefault(); loadPosts(search); };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    const success = await deletePost(postId);
    if (success) {
      toast.success('Post deleted');
      setPosts(posts.filter(p => p.id !== postId));
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Posts</h1>
          <p className="text-muted-foreground">{posts.length} posts</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadPosts(search)}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search post content..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>{post.profiles?.full_name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          @{post.profiles?.username || '—'} • {format(new Date(post.created_at), 'dd MMM yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground line-clamp-3">{post.content}</p>
                    {post.image_url && <img src={post.image_url} alt="" className="mt-2 rounded-lg max-h-32 object-cover" />}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Heart className="h-3 w-3" /> {post.likes_count || 0}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageCircle className="h-3 w-3" /> {post.comments_count || 0}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Share2 className="h-3 w-3" /> {post.shares_count || 0}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && <p className="text-center py-8 text-muted-foreground">No posts found</p>}
        </div>
      )}
    </div>
  );
};

export default AdminPosts;
