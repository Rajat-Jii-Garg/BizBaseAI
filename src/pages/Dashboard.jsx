
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Target,
  Plus,
  Eye,
  X,
  Trophy,
  Loader2,
  User,
  UserPlus,
  Brain,
  Sparkles,
  Zap,
  MessageSquare,
  Bell,
  Settings,
  Award,
  Briefcase,
  Globe,
  BookOpen,
  Lightbulb,
  RefreshCw,
  Edit
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedPostComposer from '@/components/EnhancedPostComposer';
import EnhancedPostCard from '@/components/EnhancedPostCard';
import ConnectionsList from '@/components/ConnectionsList';
import AINetworkingAssistant from '@/components/AINetworkingAssistant';
import TrendingHashtags from '@/components/TrendingHashtags';
import { usePosts } from '@/hooks/usePosts';
import { useConnections } from '@/hooks/useConnections';
import { useRealTimeEngagement } from '@/hooks/useRealTimeEngagement';
import { supabase } from '@/integrations/supabase/client';
import WelcomeFlow from '@/components/WelcomeFlow';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';
import NetworkSuggestions from '@/components/NetworkSuggestions';
import QuickProfileActions from '@/components/QuickProfileActions'

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(true);
  const [allPosts, setAllPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [smartConnections, setSmartConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  
  const { 
    posts: userPosts, 
    loading: userPostsLoading, 
    createPost, 
    editPost,
    deletePost,
    refreshPosts 
  } = usePosts();
  
  const { 
    connections, 
    pendingRequests, 
    loading: connectionsLoading,
    respondToRequest 
  } = useConnections();

  // Profile is now fetched by AuthContext, no need to fetch here

  // Fetch performance analytics (last 7 days)
  const fetchPerformanceData = async () => {
    if (!user) return;
    
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get posts reach (likes + comments + shares)
      const { data: postsData } = await supabase
        .from('posts')
        .select('likes_count, comments_count, shares_count')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      const totalReach = postsData?.reduce((sum, post) => 
        sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0), 0) || 0;
      
      const totalEngagement = postsData?.reduce((sum, post) => 
        sum + (post.likes_count || 0) + (post.comments_count || 0), 0) || 0;

      // Get new connections this week
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .gte('created_at', sevenDaysAgo.toISOString());

      setPerformanceData({
        reach: totalReach,
        engagement: totalEngagement,
        networkGrowth: connectionsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  // Fetch smart connection suggestions
  const fetchSmartConnections = async () => {
    if (!user) return;
    
    try {
      setLoadingConnections(true);
      
      // Get users who are not already connected and not the current user
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const connectedUserIds = new Set();
      existingConnections?.forEach(conn => {
        if (conn.requester_id !== user.id) connectedUserIds.add(conn.requester_id);
        if (conn.addressee_id !== user.id) connectedUserIds.add(conn.addressee_id);
      });

      const { data: suggestions } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name, industry')
        .neq('id', user.id)
        .limit(10);

      const filteredSuggestions = suggestions?.filter(suggestion => 
        !connectedUserIds.has(suggestion.id)
      ).slice(0, 3) || [];

      setSmartConnections(filteredSuggestions);
    } catch (error) {
      console.error('Error fetching smart connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const fetchAllPosts = async () => {
    if (!user) return;
    
    try {
      console.log('Dashboard: Fetching all posts...');
      setLoadingPosts(true);
      
      // First get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) {
        console.error('Dashboard: Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('Dashboard: Posts fetched:', postsData?.length || 0);

      if (!postsData || postsData.length === 0) {
        setAllPosts([]);
        setLoadingPosts(false);
        return;
      }

      // Get unique user IDs
      const userIds = Array.from(new Set(postsData.map(post => post.user_id)));
      console.log('Dashboard: Fetching profiles for user IDs:', userIds);

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Dashboard: Error fetching profiles:', profilesError);
      }

      // Create profiles map
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Check likes for current user
      let likedPostIds = new Set();
      if (user) {
        const postIds = postsData.map(post => post.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        likedPostIds = new Set(likes?.map(like => like.post_id) || []);
      }

      // Combine data
      const enrichedPosts = postsData.map(post => ({
        ...post,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        profiles: profilesMap.get(post.user_id) || { 
          full_name: 'Unknown User',
          avatar_url: null,
          current_position: null,
          company_name: null
        },
        user_has_liked: likedPostIds.has(post.id)
      }));

      console.log('Dashboard: Final enriched posts:', enrichedPosts);
      setAllPosts(enrichedPosts);
    } catch (error) {
      console.error('Dashboard: Error fetching all posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  // Real-time engagement hook
  useRealTimeEngagement(fetchAllPosts);

  useEffect(() => {
    if (user && !authLoading) {
      fetchAllPosts();
      fetchPerformanceData();
      fetchSmartConnections();
    }
  }, [user, authLoading]);

  const handleCreatePost = async (content, mediaUrl, mediaType) => {
    console.log('Dashboard: Creating post with content:', content, 'mediaUrl:', mediaUrl);
    try {
      await createPost(content, mediaUrl);
      await fetchAllPosts(); // Refresh all posts after creation
    } catch (error) {
      console.error('Dashboard: Error creating post:', error);
    }
  };

  const handleSuggestConnection = async (profileId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user?.id,
          addressee_id: profileId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection Request Sent!",
        description: "Your connection request has been sent successfully."
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    }
  };

  const profileStats = [
    { 
      label: "Post Reach", 
      value: performanceData?.reach?.toString() || "0", 
      change: performanceData?.reach > 0 ? "+15.2%" : "0%", 
      icon: BarChart3, 
      color: "text-green-600" 
    },
    { 
      label: "Engagement", 
      value: performanceData?.engagement?.toString() || "0", 
      change: performanceData?.engagement > 0 ? "+8.7%" : "0%", 
      icon: TrendingUp, 
      color: "text-purple-600" 
    },
    { 
      label: "Network Growth", 
      value: performanceData?.networkGrowth?.toString() || "0", 
      change: performanceData?.networkGrowth > 0 ? "+12.4%" : "0%", 
      icon: Users, 
      color: "text-orange-600" 
    },
  ];

  const quickActions = [
    { label: "Find Connections", icon: UserPlus, action: () => navigate('/connections'), color: "bg-green-600" },
    { label: "AI Insights", icon: Brain, action: () => navigate('/insights'), color: "bg-purple-600" },
  ];

  const handleSendConnectionRequest = async (profileId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user?.id,
          addressee_id: profileId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection Request Sent!",
        description: "Your connection request has been sent successfully."
      });

      // Remove from suggestions
      setSmartConnections(prev => prev.filter(conn => conn.id !== profileId));
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    }
  };

  const handleAcceptRequest = (connectionId) => {
    respondToRequest(connectionId, 'accepted');
  };

  const handleRejectRequest = (connectionId) => {
    respondToRequest(connectionId, 'rejected');
  };

  const handleViewProfile = () => {
    navigate('/profile-dashboard');
  };

  // Show loader while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <WelcomeFlow />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Profile Completion Banner */}
          <ProfileCompletionBanner />

          {/* Welcome Banner */}
          {showWelcome && (
            <Card className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
              </div>
              <CardContent className="p-6 relative z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-8 w-8"
                  onClick={() => setShowWelcome(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center justify-between pr-12">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="w-6 h-6" />
                        Welcome to BizBase AI, {profile?.full_name?.split(' ')[0] || 'Professional'}!
                      </h2>
                      <p className="text-white/90 text-lg">
                        🚀 Experience next-generation professional networking with AI-powered insights
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Profile & Stats */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center" 
                     style={profile?.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : {}}>
                </div>
                <CardContent className="p-6 text-center relative">
                  <Avatar 
                    className="h-20 w-20 mx-auto -mt-12 mb-4 ring-4 ring-white shadow-xl cursor-pointer hover:ring-blue-200 transition-all"
                    onClick={() => navigate('/profile-dashboard')}
                  >
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 
                    className="font-bold text-gray-900 mb-1 text-lg cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate('/profile-dashboard')}
                  >
                    {profile?.full_name || 'Professional User'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    AI-Enhanced Profile
                  </p>
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{connections.length}</div>
                      <div className="text-xs text-gray-500">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{profile?.profile_completion_score || 0}%</div>
                      <div className="text-xs text-gray-500">AI Score</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/profile-dashboard')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                          <p className="text-xs text-gray-500">Last 7 days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-start p-4 h-auto space-x-3 hover:shadow-md transition-all"
                      onClick={action.action}
                    >
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Feed */}
            <div className="lg:col-span-6 space-y-6">
              <EnhancedPostComposer onCreatePost={handleCreatePost} />

              <div className="space-y-6">
                {loadingPosts ? (
                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-12 text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600 text-lg">Loading your personalized feed...</p>
                    </CardContent>
                  </Card>
                ) : allPosts.length === 0 ? (
                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-12 text-center">
                      <div className="text-gray-400 mb-6">
                        <div className="p-4 bg-blue-50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                          <MessageSquare className="w-12 h-12 text-blue-500" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to BizBase AI!</h3>
                      <p className="text-gray-600 mb-6 text-lg">Start your AI-powered professional journey! Create your first post to connect with other professionals.</p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span>AI Content Suggestions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-blue-500" />
                          <span>Smart Networking</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  allPosts.map((post) => (
                    <EnhancedPostCard
                      key={post.id}
                      post={post}
                      onEngagementUpdate={fetchAllPosts}
                      onEdit={editPost}
                      onDelete={deletePost}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar - Connections & Insights */}
            <div className="lg:col-span-3 space-y-6">

              {/* Smart Connections */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Smart Connections
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchSmartConnections}
                      disabled={loadingConnections}
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingConnections ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingConnections ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    </div>
                  ) : smartConnections.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600">No suggestions available</p>
                      <p className="text-sm text-gray-500">Try refreshing to get new connections</p>
                    </div>
                  ) : (
                    smartConnections.map((connection) => (
                      <div key={connection.id} className="p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <Avatar 
                            className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
                            onClick={() => navigate(`/profile/${connection.id}`)}
                          >
                            <AvatarImage src={connection.avatar_url} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                              {connection.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                              onClick={() => navigate(`/profile/${connection.id}`)}
                            >
                              {connection.full_name || 'Professional User'}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {connection.current_position || 'Professional'} 
                              {connection.company_name && ` at ${connection.company_name}`}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendConnectionRequest(connection.id)}
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                Connect
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/messages?user=${connection.id}`)}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate('/connections')}
                  >
                    View More Recommendations
                  </Button>
                </CardContent>
              </Card>

              {/* Industry Insights */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Industry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">AI in Business</h4>
                        <p className="text-sm text-gray-600 mb-2">78% of companies are adopting AI solutions</p>
                        <div className="text-xs text-blue-600 font-medium">Trending in your industry</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Remote Work</h4>
                        <p className="text-sm text-gray-600 mb-2">Hybrid models becoming standard</p>
                        <div className="text-xs text-green-600 font-medium">High engagement topic</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <TrendingHashtags />

              {connectionsLoading ? (
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </CardContent>
                </Card>
              ) : (
                <ConnectionsList
                  connections={connections}
                  pendingRequests={pendingRequests}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                />
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
