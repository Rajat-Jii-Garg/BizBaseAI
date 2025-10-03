import DashboardLayout from '@/components/DashboardLayout';
import ProfileEditModal from '@/components/ProfileEditModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Camera,
  CheckCircle,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Share2,
  Eye,
  Users,
  Bookmark,
  FileText,
  MessageSquare,
  Repeat2,
  Settings,
  User,
  Briefcase,
  Calendar
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('about');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    mentions: 0,
    reposts: 0,
    articles: 0,
    saved: 0,
    totalEngagement: 0
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [connectionsRes, postsRes] = await Promise.all([
        supabase
          .from('connections')
          .select('id')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted'),
        supabase
          .from('posts')
          .select('likes_count, comments_count, shares_count')
          .eq('user_id', user.id)
      ]);

      const totalEngagement = postsRes.data?.reduce((sum, post) => 
        sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0), 0) || 0;

      setStats({
        connections: connectionsRes.data?.length || 0,
        posts: postsRes.data?.length || 0,
        mentions: 12,
        reposts: 8,
        articles: 6,
        saved: 5,
        totalEngagement: totalEngagement || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Get like status for current user
      const postIds = postsData.map(post => post.id);
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(like => like.post_id) || []);

      // Combine data
      const enrichedPosts = postsData.map(post => ({
        ...post,
        profiles: profileData || {
          full_name: 'Professional User',
          avatar_url: null,
          current_position: null,
          company_name: null
        },
        user_has_liked: likedPostIds.has(post.id)
      }));

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive'
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const updateField = type === 'avatar' ? 'avatar_url' : 'banner_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
      toast({
        title: 'Success',
        description: `${type === 'avatar' ? 'Profile photo' : 'Cover image'} updated successfully`
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Link copied!',
      description: 'Profile link copied to clipboard'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-6">
        {/* Profile Header */}
        <Card className="overflow-hidden bg-card border-border shadow-lg">
          {/* Cover Image */}
          <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20">
            <img
              src={profile?.banner_url || 'https://images.unsplash.com/photo-1557683316-973673baf926'}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                <Users className="w-3 h-3 mr-1" />
                {stats.connections} Connections
              </Badge>
              <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                Pro Member
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 md:top-4 right-2 md:right-4 bg-background/80 backdrop-blur-sm hover:bg-background text-xs md:text-sm"
              onClick={() => document.getElementById('banner-upload').click()}
              disabled={uploading}
            >
              <Camera className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Edit Cover</span>
            </Button>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
            />
          </div>

          {/* Profile Info */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 md:-mt-16 relative">
              {/* Avatar */}
              <div className="relative mb-4 md:mb-0">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl md:text-3xl font-bold">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full shadow-md hover:shadow-lg h-8 w-8"
                  onClick={() => document.getElementById('avatar-upload').click()}
                  disabled={uploading}
                >
                  <Camera className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-green-500 rounded-full border-2 border-background" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'avatar')}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button variant="default" onClick={handleShare} size="sm" className="flex-1 md:flex-none">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => navigate(`/public-profile/${user.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="mt-4 space-y-3">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                  {profile?.full_name || 'Professional User'}
                  {profile?.is_verified && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mt-1">
                  {profile?.profession || profile?.current_position || 'Senior Product Manager & Digital Innovation Leader'}
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile?.company_name && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
                      {profile.company_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    Joined {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 p-3 md:p-4 bg-muted/30 rounded-lg">
                {profile?.email && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Mail className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground truncate">{profile.email}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Phone className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{profile.phone}</span>
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Globe className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {profile?.linkedin_url && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Linkedin className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border lg:sticky lg:top-20">
              <CardHeader className="pb-3 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profile Navigation</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Explore content sections</p>
              </CardHeader>
              <CardContent className="p-0 px-2 md:px-0">
                <div className="space-y-1">
                  <Button
                    variant={activeSection === 'about' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('about')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    About
                  </Button>
                  <Button
                    variant={activeSection === 'posts' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('posts')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Posts
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.posts}</Badge>
                  </Button>
                  <Button
                    variant={activeSection === 'mentions' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('mentions')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mentions
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.mentions}</Badge>
                  </Button>
                  <Button
                    variant={activeSection === 'reposts' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('reposts')}
                  >
                    <Repeat2 className="w-4 h-4 mr-2" />
                    Reposts
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.reposts}</Badge>
                  </Button>
                  <Button
                    variant={activeSection === 'articles' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('articles')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Articles
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.articles}</Badge>
                  </Button>
                  <Button
                    variant={activeSection === 'saved' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('saved')}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.saved}</Badge>
                  </Button>
                  
                  <Separator className="my-2" />
                  
                  <ProfileEditModal onProfileUpdate={fetchProfile}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </ProfileEditModal>
                </div>
                
                <Separator className="my-4" />
                
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Engagement</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stats.totalEngagement.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* About Section */}
            {activeSection === 'about' && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                    About
                  </CardTitle>
                  <ProfileEditModal onProfileUpdate={fetchProfile}>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </ProfileEditModal>
                </CardHeader>
                <CardContent className="space-y-4 px-4 md:px-6">
                  <p className="text-foreground leading-relaxed text-sm md:text-base">
                    {profile?.bio || profile?.about || 'Passionate product manager with 8+ years of experience driving digital transformation at Fortune 500 companies. I specialize in building user-centered products that solve real-world problems and deliver measurable business impact. Currently leading cross-functional teams to develop next-generation SaaS solutions that empower businesses to scale efficiently. My expertise spans across agile methodologies, user experience design, data analytics, and strategic planning. I believe in fostering collaborative environments where innovation thrives and teams can achieve extraordinary results.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">#ProductManagement</Badge>
                    <Badge variant="secondary" className="text-xs">#Innovation</Badge>
                    <Badge variant="secondary" className="text-xs">#Leadership</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Section */}
            {activeSection === 'posts' && (
              <Card className="bg-card border-border">
                <CardHeader className="px-4 md:px-6">
                  <CardTitle className="text-base md:text-lg">Recent Posts ({stats.posts})</CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  {postsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/public-profile/${post.user_id}`)}>
                              <AvatarImage src={post.profiles?.avatar_url || profile?.avatar_url} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {post.profiles?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm cursor-pointer transition-colors" onClick={() => navigate(`/public-profile/${post.user_id}`)}>{post.profiles?.full_name || profile?.full_name}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{post.profiles?.current_position || profile?.current_position}</p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
                          {post.image_url && (
                            <img 
                              src={post.image_url} 
                              alt="Post" 
                              className="w-full rounded-lg max-h-96 object-cover"
                            />
                          )}
                          <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.comments_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Repeat2 className="w-4 h-4" />
                              {post.shares_count || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 md:py-12 text-muted-foreground">
                      <FileText className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm md:text-base">No posts yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => navigate('/feed')}
                      >
                        Create Your First Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Other sections */}
            {(activeSection === 'mentions' || activeSection === 'reposts' || activeSection === 'articles' || activeSection === 'saved') && (
              <Card className="bg-card border-border">
                <CardHeader className="px-4 md:px-6">
                  <CardTitle className="capitalize text-base md:text-lg">{activeSection}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <p className="text-sm md:text-base">No {activeSection} yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileDashboard;
