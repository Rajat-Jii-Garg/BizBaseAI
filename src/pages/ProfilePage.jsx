import DashboardLayout from '@/components/DashboardLayout';
import ProfileEditModal from '@/components/ProfileEditModal';
import EnhancedPostCard from '@/components/EnhancedPostCard';
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
import { useConnections } from '@/hooks/useConnections';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from "react-router-dom";
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
  Calendar,
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
  MoreHorizontal,
  ChevronRight,
  Award,
  Target,
  Coins,
  Star,
  BadgeCheck,
  Building,
  GraduationCap,
  FolderOpen,
  Handshake,
  Lightbulb,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const { userId } = useParams();
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    projectsCompleted: 0,
    clientsHelped: 0,
    bizcoins: 0
  });
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connect, connections, sentRequests, receivedRequests } = useConnections();

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (user && userId) {
      fetchProfile();
      fetchStats();
      fetchPosts();
      fetchSkills();
      fetchExperience();
      fetchCertificates();
      fetchRecentActivity();
    }
  }, [user, userId]);

  useEffect(() => {
    if (!user || !userId) return;

    const channel = supabase
      .channel(`profile_posts_${userId}_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${userId}` }, () => {
        fetchPosts();
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userId]);

  const checkConnectionStatus = () => {
    if (isOwnProfile) return;

    const isConnected = connections.some(
      conn => conn.requester_id === userId || conn.addressee_id === userId
    );
    if (isConnected) {
      setConnectionStatus('connected');
      return;
    }

    const hasSentRequest = sentRequests.some(req => req.addressee_id === userId);
    if (hasSentRequest) {
      setConnectionStatus('pending_sent');
      return;
    }

    const hasReceivedRequest = receivedRequests.some(req => req.requester_id === userId);
    if (hasReceivedRequest) {
      setConnectionStatus('pending_received');
      return;
    }

    setConnectionStatus(null);
  };

  useEffect(() => {
    checkConnectionStatus();
  }, [connections, sentRequests, receivedRequests, userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
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
        supabase.from('connections').select('id').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`).eq('status', 'accepted'),
        supabase.from('posts').select('likes_count, comments_count, shares_count').eq('user_id', userId)
      ]);

      setStats({
        connections: connectionsRes.data?.length || 0,
        posts: postsRes.data?.length || 0,
        projectsCompleted: Math.floor(Math.random() * 50) + 10,
        clientsHelped: Math.floor(Math.random() * 30) + 5,
        bizcoins: profile?.bizcoins || 0
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name')
        .eq('id', userId)
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
        .eq('user_id', userId)
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
        .eq('user_id', userId)
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
        .eq('user_id', userId)
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file || !isOwnProfile) return;

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
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(profileUrl);
    toast({ title: 'Link copied!', description: 'Profile link copied to clipboard' });
  };

  const handleConnect = async () => {
    if (!userId || connectLoading) return;
    setConnectLoading(true);
    try {
      await connect(userId);
      setConnectionStatus('pending_sent');
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleMessage = () => {
    navigate('/messages', { state: { selectedUserId: userId } });
  };

  const profileCompletionScore = profile?.profile_completion_score || 70;

  const getConnectionButton = () => {
    if (connectionStatus === 'connected') {
      return (
        <Button variant="outline" className="gap-2" disabled>
          <UserCheck className="w-4 h-4 text-green-600" />
          Connected
        </Button>
      );
    }
    if (connectionStatus === 'pending_sent') {
      return (
        <Button variant="outline" className="gap-2" disabled>
          <Clock className="w-4 h-4 text-amber-600" />
          Request Sent
        </Button>
      );
    }
    if (connectionStatus === 'pending_received') {
      return (
        <Button variant="default" className="gap-2 bg-primary" onClick={() => navigate('/connections')}>
          <UserPlus className="w-4 h-4" />
          Accept Request
        </Button>
      );
    }
    return (
      <Button variant="default" className="gap-2 bg-primary hover:bg-primary/90" onClick={handleConnect} disabled={connectLoading}>
        {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        Connect
      </Button>
    );
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
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-6 pb-8">
        {/* Cover Section */}
        <Card className="overflow-hidden bg-card border-border shadow-lg rounded-xl">
          <div className="relative h-40 md:h-56 bg-gradient-to-r from-primary/30 via-accent/30 to-secondary/30">
            <img
              src={profile?.banner_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200'}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {isOwnProfile && (
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/90 backdrop-blur-sm hover:bg-background gap-2"
                  onClick={() => document.getElementById('banner-upload').click()}
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4" />
                  Edit Cover
                </Button>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                />
              </div>
            )}
          </div>

          {/* Hero Section */}
          <div className="px-4 md:px-8 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              {/* Avatar */}
              <div className="relative -mt-16 md:-mt-20">
                <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl md:text-4xl font-bold">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {profile?.is_verified && (
                  <div className="absolute bottom-2 right-2 bg-primary rounded-full p-1">
                    <CheckCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
                {isOwnProfile && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full shadow-md h-8 w-8"
                      onClick={() => document.getElementById('avatar-upload').click()}
                      disabled={uploading}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'avatar')}
                    />
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                      {profile?.full_name || 'Professional User'}
                      {profile?.is_verified && (
                        <BadgeCheck className="w-6 h-6 text-primary" />
                      )}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground">
                      {profile?.profession || profile?.current_position || 'Professional Member'}
                      {profile?.company_name && ` & ${profile.company_name}`}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {isOwnProfile ? (
                      <>
                        <ProfileEditModal onProfileUpdate={fetchProfile}>
                          <Button variant="default" className="gap-2">
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                          </Button>
                        </ProfileEditModal>
                        <Button variant="outline" onClick={handleShare} className="gap-2">
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </>
                    ) : (
                      <>
                        {getConnectionButton()}
                        <Button variant="outline" className="gap-2" onClick={handleMessage}>
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <MoreHorizontal className="w-4 h-4" />
                              More
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleShare}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Profile
                            </DropdownMenuItem>
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
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground max-w-2xl">
                  {profile?.bio || 'Building innovative solutions and driving digital transformation.'}
                </p>
              </div>
            </div>

            {/* Contact Info Bar */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
              {profile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <Globe className="w-4 h-4" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>
        </Card>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Navigation */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profile Navigation</CardTitle>
                <p className="text-xs text-muted-foreground">Explore content sections</p>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: User },
                    { id: 'projects', label: 'Projects', icon: FolderOpen, count: certificates.length },
                    { id: 'services', label: 'Services', icon: Briefcase },
                    { id: 'posts', label: 'Posts', icon: FileText, count: stats.posts },
                    { id: 'mentions', label: 'Mentions', icon: MessageSquare },
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {item.count !== undefined && (
                        <Badge variant="secondary" className="ml-auto">{item.count}</Badge>
                      )}
                    </Button>
                  ))}
                  
                  {isOwnProfile && (
                    <>
                      <Separator className="my-2" />
                      <ProfileEditModal onProfileUpdate={fetchProfile}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </ProfileEditModal>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* BizScore Card */}
            <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-border">
              <CardContent className="p-6 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">{profile?.bizcoins || 720}</span>
                    </div>
                  </div>
                  <BadgeCheck className="absolute -top-1 -right-1 w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mt-3">Bizcenta</p>
                <p className="text-xs text-muted-foreground">Experienced</p>
              </CardContent>
            </Card>
          </div>

          {/* Middle Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Content Tabs */}
            <Card className="bg-card border-border">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto">
                  {['Overview', 'Projects', 'Services', 'Case Studies', 'Posts'].map((tab) => (
                    <TabsTrigger
                      key={tab.toLowerCase().replace(' ', '-')}
                      value={tab.toLowerCase().replace(' ', '-')}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </Card>

            {/* My Value & Impact */}
            {activeTab === 'overview' && (
              <>
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">My Value & Impact</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View more <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold text-foreground">{stats.clientsHelped}</p>
                        <p className="text-xs text-muted-foreground">Clients Helped</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold text-foreground">{stats.projectsCompleted}</p>
                        <p className="text-xs text-muted-foreground">Projects Completed</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                        <p className="text-2xl font-bold text-foreground">{stats.connections}</p>
                        <p className="text-xs text-muted-foreground">Connections</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                        <p className="text-2xl font-bold text-foreground">{profile?.bizcoins || 0}</p>
                        <p className="text-xs text-muted-foreground">BizCoins Earned</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Verified Skills */}
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Verified Skills</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {skills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {skills.slice(0, 6).map((skill) => (
                          <div key={skill.id} className="p-4 border border-border rounded-lg bg-muted/20">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <BadgeCheck className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{skill.skill_name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{skill.level} Level</p>
                                <p className="text-xs text-muted-foreground">{skill.endorsements_count} endorsements</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No skills added yet</p>
                        {isOwnProfile && (
                          <ProfileEditModal onProfileUpdate={() => { fetchProfile(); fetchSkills(); }}>
                            <Button variant="outline" size="sm" className="mt-3">Add Skills</Button>
                          </ProfileEditModal>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Experience */}
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Experience</CardTitle>
                    {isOwnProfile && (
                      <ProfileEditModal onProfileUpdate={() => { fetchProfile(); fetchExperience(); }}>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </ProfileEditModal>
                    )}
                  </CardHeader>
                  <CardContent>
                    {experience.length > 0 ? (
                      <div className="space-y-6">
                        {experience.map((exp, index) => (
                          <div key={exp.id} className="relative pl-6 pb-6 last:pb-0">
                            {index !== experience.length - 1 && (
                              <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-border" />
                            )}
                            <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Briefcase className="w-3 h-3 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-foreground">{exp.position}</h4>
                                <p className="text-sm text-muted-foreground">{exp.company}</p>
                                {exp.description && (
                                  <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="w-fit">
                                {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : ''}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No experience added yet</p>
                        {isOwnProfile && (
                          <ProfileEditModal onProfileUpdate={() => { fetchProfile(); fetchExperience(); }}>
                            <Button variant="outline" size="sm" className="mt-3">Add Experience</Button>
                          </ProfileEditModal>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Projects and Certifications */}
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Projects and Certifications</CardTitle>
                    {isOwnProfile && (
                      <ProfileEditModal onProfileUpdate={() => { fetchProfile(); fetchCertificates(); }}>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </ProfileEditModal>
                    )}
                  </CardHeader>
                  <CardContent>
                    {certificates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certificates.map((cert) => (
                          <div key={cert.id} className="p-4 border border-border rounded-lg bg-muted/20">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-amber-500/10 rounded-full">
                                <Award className="w-5 h-5 text-amber-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{cert.title}</h4>
                                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                                {cert.issue_date && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Issued {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                                {cert.credential_url && (
                                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                                    View Credential
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No certifications added yet</p>
                        {isOwnProfile && (
                          <ProfileEditModal onProfileUpdate={() => { fetchProfile(); fetchCertificates(); }}>
                            <Button variant="outline" size="sm" className="mt-3">Add Certifications</Button>
                          </ProfileEditModal>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {postsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="animate-spin h-10 w-10 mx-auto text-primary mb-4" />
                    <p className="text-muted-foreground">Loading posts...</p>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <EnhancedPostCard key={post.id} post={post} onEngagementUpdate={fetchPosts} />
                  ))
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">
                        {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
                      </p>
                      {isOwnProfile && (
                        <Button variant="outline" onClick={() => navigate('/dashboard')}>
                          Create Your First Post
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Other Tabs */}
            {['projects', 'services', 'case-studies', 'mentions'].includes(activeTab) && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No {activeTab.replace('-', ' ')} yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Completion */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-semibold text-foreground">Your Profile is {profileCompletionScore}%</p>
                    <p className="text-sm text-muted-foreground">Boost your profile to unlock more opportunities.</p>
                  </div>
                  <div className="relative">
                    <img 
                      src="https://illustrations.popsy.co/amber/success.svg" 
                      alt="Success" 
                      className="w-16 h-16"
                    />
                  </div>
                </div>
                <Progress value={profileCompletionScore} className="h-2 mb-4" />
                <Button variant="default" className="w-full bg-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Show Suggestions
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">{profile?.full_name?.split(' ')[0]}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {new Date(activity.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {activity.content.substring(0, 60)}...
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Explore Opportunities */}
            <Card className="bg-gradient-to-br from-primary/20 via-card to-accent/20 border-border overflow-hidden">
              <CardContent className="p-6 relative">
                <h3 className="text-lg font-semibold text-foreground mb-2">Explore Opportunities Together</h3>
                <img 
                  src="https://illustrations.popsy.co/amber/work-party.svg" 
                  alt="Opportunities" 
                  className="w-24 h-24 absolute top-4 right-4 opacity-80"
                />
                <Button variant="default" className="mt-4 bg-primary w-full">
                  <Handshake className="w-4 h-4 mr-2" />
                  Let's Connect
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
