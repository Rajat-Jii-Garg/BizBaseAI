import DashboardLayout from '@/components/DashboardLayout';
import ProfileEditModal from '@/components/ProfileEditModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Share2,
  Eye,
  Users,
  FileText,
  MessageSquare,
  Settings,
  User,
  Briefcase,
  ChevronDown,
  Award,
  Target,
  Coins,
  BadgeCheck,
  GraduationCap,
  FolderOpen,
  Handshake,
  Lightbulb,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Calendar
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PowerScoreCard from '@/components/PowerScoreCard';
import AchievementBadges from '@/components/AchievementBadges';
import ReferralWidget from '@/components/ReferralWidget';
import BizCoinsCard from '@/components/BizCoinsCard';
const ProfileDashboard = () => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [activeNav, setActiveNav] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    bizcoins: 0,
    projectsCompleted: 0,
    clientsHelped: 0
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchPosts();
      fetchSkills();
      fetchExperience();
      fetchCertificates();
      fetchRecentActivity();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`my_profile_${user.id}_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${user.id}` }, () => {
        fetchPosts();
        fetchStats();
        fetchRecentActivity();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_skills', filter: `user_id=eq.${user.id}` }, () => fetchSkills())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_experience', filter: `user_id=eq.${user.id}` }, () => fetchExperience())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_certificates', filter: `user_id=eq.${user.id}` }, () => fetchCertificates())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      toast({ title: 'Error', description: 'Failed to load profile data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [connectionsRes, postsRes] = await Promise.all([
        supabase.from('connections').select('id').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq('status', 'accepted'),
        supabase.from('posts').select('likes_count, comments_count, shares_count').eq('user_id', user.id)
      ]);

      setStats({
        connections: connectionsRes.data?.length || 0,
        posts: postsRes.data?.length || 0,
        bizcoins: profile?.bizcoins || 0,
        projectsCompleted: profile?.posts_count || postsRes.data?.length || 0,
        clientsHelped: connectionsRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name, username')
        .eq('id', user.id)
        .single();

      const postIds = postsData.map(post => post.id);
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(like => like.post_id) || []);

      const enrichedPosts = postsData.map(post => ({
        ...post,
        profiles: profileData || { full_name: 'Professional User', avatar_url: null, current_position: null, company_name: null },
        user_has_liked: likedPostIds.has(post.id)
      }));

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('endorsements_count', { ascending: false });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchExperience = async () => {
    try {
      const { data, error } = await supabase
        .from('user_experience')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperience(data || []);
    } catch (error) {
      console.error('Error fetching experience:', error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('user_certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
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

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const updateField = type === 'avatar' ? 'avatar_url' : 'banner_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
      toast({ title: 'Success', description: `${type === 'avatar' ? 'Profile photo' : 'Cover image'} updated successfully` });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({ title: 'Link copied!', description: 'Profile link copied to clipboard' });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const profileCompletionScore = profile?.profile_completion_score || 0;

  const navItems = [
    { id: 'posts', label: 'Posts', icon: FileText, count: stats.posts },
    { id: 'projects', label: 'Projects', icon: FolderOpen, count: certificates.length },
    { id: 'services', label: 'Services', icon: Briefcase, count: skills.length },
    { id: 'case-studies', label: 'Case Studies', icon: Target },
    { id: 'overview', label: 'Overview', icon: User },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5B6CFF]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-6 pb-8">
        {/* Cover Section */}
        <Card className="overflow-hidden bg-card border-border shadow-lg rounded-xl">
          <div className="relative h-40 md:h-52 bg-gradient-to-r from-[#5B6CFF]/30 via-[#8B5CF6]/30 to-[#06B6D4]/30">
            <img
              src={profile?.banner_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200'}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            
            {/* Cover Action Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {/* Edit Cover Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white backdrop-blur-sm gap-2 text-gray-700"
                    disabled={uploading}
                  >
                    <Camera className="w-4 h-4" />
                    Edit Cover
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => document.getElementById('banner-upload').click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => document.getElementById('banner-upload').click()}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Change Cover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-[#5B6CFF] hover:bg-[#4A5AEE] text-white gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    More
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Handshake className="w-4 h-4 mr-2" />
                    Collaborate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Hire Me
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Invest with Me
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
              />
            </div>
          </div>

          {/* Hero Section */}
          <div className="px-4 md:px-8 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              {/* Avatar */}
              <div className="relative -mt-16 md:-mt-20">
                <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-white shadow-xl">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] text-white text-3xl md:text-4xl font-bold">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {profile?.is_verified && (
                  <div className="absolute bottom-2 right-2 bg-[#10B981] rounded-full p-1.5 border-2 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 left-0 rounded-full shadow-md hover:shadow-lg h-8 w-8 bg-white"
                  onClick={() => document.getElementById('avatar-upload').click()}
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'avatar')}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 pt-2 md:pt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                      {profile?.full_name || 'Professional User'}
                    </h1>
                    {profile?.username && (
                      <p className="text-base text-primary font-medium">@{profile.username}</p>
                    )}
                    <p className="text-base md:text-lg text-muted-foreground mt-1">
                      {profile?.profession || profile?.current_position || 'Professional'} 
                      {profile?.company_name && <span className="font-medium text-foreground"> & {profile.company_name}</span>}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                      {profile?.bio || 'Building innovative solutions and driving digital transformation.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <ProfileEditModal onProfileUpdate={fetchProfile}>
                      <Button size="sm" className="gap-1.5 bg-[#5B6CFF] hover:bg-[#4A5AEE] text-white text-xs md:text-sm md:size-default">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit Profile</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                    </ProfileEditModal>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs md:text-sm md:size-default" onClick={handleShare}>
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs md:text-sm md:size-default" onClick={() => {
                      if (profile?.username) {
                        navigate(`/@${profile.username}?preview=true`);
                      } else {
                        toast({ title: 'Username Required', description: 'Please set a username first to preview your profile.', variant: 'destructive' });
                      }
                    }}>
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info - respects privacy settings */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-6 text-sm text-muted-foreground border-t border-border pt-4">
              {profile?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#5B6CFF] hover:underline">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Mobile/Tablet Navigation Bar - shown only on smaller screens */}
        <div className="lg:hidden">
          <Card className="bg-card border-border">
            <CardContent className="p-2">
              <div className="flex overflow-x-auto gap-1 scrollbar-hide">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeNav === item.id ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex-shrink-0 text-xs ${activeNav === item.id ? 'bg-[#5B6CFF] text-white' : ''}`}
                    onClick={() => {
                      setActiveNav(item.id);
                      setActiveTab(item.id);
                    }}
                  >
                    <item.icon className="w-3 h-3 mr-1" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>




        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Profile Navigation */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profile Navigation</CardTitle>
                <p className="text-xs text-muted-foreground">Explore content sections</p>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeNav === item.id ? 'default' : 'ghost'}
                      className={`w-full justify-start text-sm ${activeNav === item.id ? 'bg-[#5B6CFF] text-white' : ''}`}
                      onClick={() => {
                        setActiveNav(item.id);
                        setActiveTab(item.id);
                      }}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {item.count !== undefined && item.count > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">{item.count}</Badge>
                      )}
                    </Button>
                  ))}
                  <Separator className="my-2" />
                  <ProfileEditModal onProfileUpdate={fetchProfile}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </ProfileEditModal>
                </div>
              </CardContent>
            </Card>

            {/* Power Score - Desktop */}
            <PowerScoreCard />

            {/* BizCoins - Desktop */}
            <BizCoinsCard />
          </div>

          {/* Middle Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tabs - Desktop only (mobile uses the nav bar above) */}
            <Card className="hidden lg:block bg-card border-border">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setActiveNav(val); }} className="w-full">
                  <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none overflow-x-auto">
                    <TabsTrigger 
                      value="posts"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#5B6CFF] data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Posts
                    </TabsTrigger>
                    <TabsTrigger 
                      value="projects"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#5B6CFF] data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Projects
                    </TabsTrigger>
                    <TabsTrigger 
                      value="services"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#5B6CFF] data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Services
                    </TabsTrigger>
                    <TabsTrigger 
                      value="case-studies"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#5B6CFF] data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Case Studies
                    </TabsTrigger>
                    <TabsTrigger 
                      value="overview" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#5B6CFF] data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Overview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-semibold">My Value & Impact</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#5B6CFF] gap-1">
                    View more <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <Users className="w-6 h-6 text-[#5B6CFF] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{stats.clientsHelped}</div>
                      <p className="text-xs text-muted-foreground">Clients Helped</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <Target className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{stats.projectsCompleted}</div>
                      <p className="text-xs text-muted-foreground">Projects Completed</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-[#8B5CF6] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">₹{(profile?.bizcoins || 0) * 100}</div>
                      <p className="text-xs text-muted-foreground">Earnings</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <Coins className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{profile?.bizcoins || 0}</div>
                      <p className="text-xs text-muted-foreground">BizCoin Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services Tab Content - Verified Skills */}
            {activeTab === 'services' && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-semibold">Verified Skills & Services</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#5B6CFF] gap-1">
                    View Details <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {skills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {skills.map((skill) => (
                        <div key={skill.id} className="p-4 border border-[#10B981]/30 bg-[#10B981]/5 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-[#10B981] rounded-full">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-semibold text-foreground text-sm">{skill.skill_name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {skill.endorsements_count} endorsements • {skill.level}
                          </p>
                          <Button size="sm" className="w-full bg-[#5B6CFF] hover:bg-[#4A5AEE] text-white text-xs">
                            View Proof
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No skills added yet</p>
                      <Button variant="outline" size="sm" className="mt-4">Add Skills</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Overview - Experience */}
            {activeTab === 'overview' && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-semibold">Experience</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#5B6CFF]">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {experience.length > 0 ? (
                    <div className="space-y-6">
                      {experience.map((exp) => (
                        <div key={exp.id} className="relative pl-6 border-l-2 border-[#5B6CFF]/30">
                          <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#5B6CFF] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-[#5B6CFF]">
                                  {new Date(exp.start_date).getFullYear()}
                                </span>
                                <span className="text-foreground font-medium">{exp.position}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{exp.company}</p>
                              {exp.description && (
                                <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {exp.is_current ? 'Present' : new Date(exp.end_date || new Date()).getFullYear()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No experience added yet</p>
                      <Button variant="outline" size="sm" className="mt-4">Add Experience</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Projects Tab Content */}
            {activeTab === 'projects' && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-semibold">Projects and Certifications</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#5B6CFF]">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="p-4 border border-border rounded-xl bg-muted/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#5B6CFF]/10 rounded-lg">
                              <GraduationCap className="w-5 h-5 text-[#5B6CFF]" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground text-sm">{cert.title}</h4>
                              <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Issued {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                              </p>
                              {cert.credential_url && (
                                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5B6CFF] hover:underline mt-2 inline-flex items-center gap-1">
                                  View Credential <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {cert.is_verified && (
                              <BadgeCheck className="w-5 h-5 text-[#10B981]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No projects or certifications added yet</p>
                      <Button variant="outline" size="sm" className="mt-4">Add Project</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Case Studies Tab Content */}
            {activeTab === 'case-studies' && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-semibold">Case Studies</CardTitle>
                  <Button variant="ghost" size="sm" className="text-[#5B6CFF]">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No case studies added yet</p>
                    <p className="text-xs mt-2">Share your success stories and client transformations</p>
                    <Button variant="outline" size="sm" className="mt-4">Add Case Study</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Tab Content */}
            {activeTab === 'posts' && (
              <Card className="bg-card border-border">
                <CardHeader className="hidden lg:block">
                  <CardTitle className="text-lg font-semibold">Recent Posts ({stats.posts})</CardTitle>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5B6CFF] mx-auto"></div>
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="border border-border rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-[#5B6CFF] text-white">
                                {profile?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{profile?.full_name}</h4>
                                <span className="text-xs text-muted-foreground">{getTimeAgo(post.created_at)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{profile?.current_position}</p>
                            </div>
                          </div>
                          <p className="text-sm mt-3 text-foreground whitespace-pre-wrap">{post.content}</p>
                          {post.image_url && (
                            <img src={post.image_url} alt="Post" className="w-full rounded-lg mt-3 max-h-72 object-cover" />
                          )}
                          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                            <span>{post.likes_count || 0} likes</span>
                            <span>{post.comments_count || 0} comments</span>
                            <span>{post.shares_count || 0} shares</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No posts yet</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/feed')}>
                        Create Your First Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Completion */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Your Profile is {profileCompletionScore}%</h3>
                    <p className="text-xs text-muted-foreground mt-1">Boost your profile to unlock more opportunities.</p>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5B6CFF]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-[#5B6CFF]">{profileCompletionScore}%</span>
                    </div>
                  </div>
                </div>
                <Progress value={profileCompletionScore} className="h-2 mb-4" />
                <Button className="w-full bg-[#5B6CFF] hover:bg-[#4A5AEE] text-white">
                  Show Suggestions
                </Button>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <AchievementBadges />

            {/* Invite & Earn */}
            <ReferralWidget />
          </div>
        </div>

        {/* Mobile/Tablet Widgets - shown after tab content */}
        <div className="lg:hidden space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Your Profile is {profileCompletionScore}%</h3>
                  <p className="text-xs text-muted-foreground">Complete your profile to unlock more opportunities</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B6CFF]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#5B6CFF]">{profileCompletionScore}%</span>
                </div>
              </div>
              <Progress value={profileCompletionScore} className="h-2" />
            </CardContent>
          </Card>
          <AchievementBadges />
          <PowerScoreCard />
          <BizCoinsCard />
          <ReferralWidget />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileDashboard;
