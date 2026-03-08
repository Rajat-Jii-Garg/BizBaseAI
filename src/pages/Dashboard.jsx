import React, { useState, useEffect, useCallback } from "react";
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
  Edit,
  ArrowUp
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedPostComposer from '@/components/EnhancedPostComposer';
import TrackedPostCard from '@/components/TrackedPostCard';
import MobileCreatorFAB from '@/components/MobileCreatorFAB';
import FullPagePostCreator from '@/components/FullPagePostCreator';
import FullPageCommunityCreator from '@/components/FullPageCommunityCreator';
import FullPageEventCreator from '@/components/FullPageEventCreator';
import FullPageJobCreator from '@/components/FullPageJobCreator';
import ConnectionsList from '@/components/ConnectionsList';
import AINetworkingAssistant from '@/components/AINetworkingAssistant';
import TrendingHashtags from '@/components/TrendingHashtags';
import { usePosts } from '@/hooks/usePosts';
import { useConnections } from '@/hooks/useConnections';
import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { supabase } from '@/integrations/supabase/client';
import WelcomeFlow from '@/components/WelcomeFlow';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';
import NetworkSuggestions from '@/components/NetworkSuggestions';
import QuickProfileActions from '@/components/QuickProfileActions';
import UsernameSetupModal from '@/components/UsernameSetupModal';
import WhoViewedProfile from '@/components/WhoViewedProfile';
import AchievementBadges from '@/components/AchievementBadges';
import PowerScoreCard from '@/components/PowerScoreCard';
import ReferralWidget from '@/components/ReferralWidget';

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [smartConnections, setSmartConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const feedContainerRef = React.useRef(null);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [showCommunityCreator, setShowCommunityCreator] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [showJobCreator, setShowJobCreator] = useState(false);
  
  // Use personalized feed hook
  const {
    posts: personalizedPosts,
    loading: loadingPosts,
    refreshing,
    hasMore,
    refreshFeed,
    loadMore,
    refetch
  } = usePersonalizedFeed();

  const {
    createPost,
    editPost,
    deletePost,
  } = usePosts();
  
  const {
    connections,
    receivedRequests,
    sentRequests,
    suggestions,
    suggestionsLoading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    loading: connectionsLoading
  } = useConnections();

  // Handle scroll for infinite loading and scroll-to-top button
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    setShowScrollTop(scrollTop > 500);

    // 🔥 Auto refresh when user reaches top
    if (scrollTop === 0 && !refreshing) {
      refreshFeed();
    }

    // Infinite scroll - load more when near bottom
    if (
      window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 1000 &&
      hasMore &&
      !loadingPosts &&
      !refreshing
    ) {
      loadMore();
    }
  }, [hasMore, loadingPosts, refreshing, loadMore, refreshFeed]);

  useEffect(() => {
    refreshFeed(); // always fetch latest feed on page open
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        .select('id, username, full_name, avatar_url, current_position, company_name, industry')
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

  useEffect(() => {
    if (user && !authLoading) {
      fetchPerformanceData();
      fetchSmartConnections();
      
      // Check if user needs to set username
      if (profile && !profile.username) {
        setShowUsernameModal(true);
      }
    }
  }, [user, authLoading, profile]);

  const handleCreatePost = async (content, mediaUrl, mediaType) => {
    console.log('Dashboard: Creating post with content:', content, 'mediaUrl:', mediaUrl);
    try {
      await createPost(content, mediaUrl);
      await refetch(); // Refresh personalized feed after creation
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

      toast.success("Connection Request Sent!", { description: "Your connection request has been sent successfully." });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error("Error", { description: "Failed to send connection request" });
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

  const SendRequest = async (profileId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user?.id,
          addressee_id: profileId,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Connection Request Sent!", { description: "Your connection request has been sent successfully." });

      // Remove from suggestions
      setSmartConnections(prev => prev.filter(conn => conn.id !== profileId));
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error("Error", { description: "Failed to send connection request" });
    }
  };

  const handleacceptRequest = (connectionId) => {
    respondToRequest(connectionId, 'accepted');
  };

  const handleRejectRequest = (connectionId) => {
    respondToRequest(connectionId, 'rejected');
  };

  const handleViewProfile = () => {
    if (profile?.username) {
      navigate(`/${profile.username}`);
    }
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
      <UsernameSetupModal 
        open={showUsernameModal} 
        onClose={() => setShowUsernameModal(false)} 
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{ overflowX: 'clip' }}>
        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-0 sm:py-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Sidebar - Profile & Stats */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <div className="h-16 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center" 
                    style={profile?.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : {}}>
                </div>
                <CardContent className="p-4 sm:p-6 text-center relative">
                  <Avatar 
                    className="h-16 w-16 sm:h-20 sm:w-20 mx-auto -mt-10 sm:-mt-12 mb-3 sm:mb-4 ring-4 ring-white shadow-xl cursor-pointer hover:ring-blue-200 transition-all"
                    onClick={() => navigate(`/${profile?.username}`)}
                  >
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-base sm:text-lg">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 
                    className="font-bold text-gray-900 mb-1 text-base sm:text-lg cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/${profile?.username}`)}
                  >
                    {profile?.full_name || 'Professional User'}
                  </h3>
                  {profile?.username && (
                    <p className="text-sm text-primary font-medium mb-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(`/${profile?.username}`)}>@{profile.username}</p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 flex items-center justify-center gap-2">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                    AI-Enhanced Profile
                  </p>
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold text-blue-600">{connections.length}</div>
                      <div className="text-xs text-gray-500">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold text-purple-600">{profile?.profile_completion_score || 0}%</div>
                      <div className="text-xs text-gray-500">AI Score</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs sm:text-sm"
                    onClick={() => navigate(`/${profile?.username}`)}
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
            <div className="col-span-1 lg:col-span-6 space-y-0 sm:space-y-2 overflow-x-hidden scrollbar-hide" ref={feedContainerRef}>
              {/* Post Composer - Hidden on small screens */}
              <div className="hidden lg:block">
                <EnhancedPostComposer onCreatePost={handleCreatePost} />
              </div>

              <div className="space-y-0 sm:space-y-4">
                {loadingPosts && personalizedPosts.length === 0 ? (
                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-12 text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600 text-lg">Top Latest Posts...</p>
                      <p className="text-gray-500 text-sm mt-2">Refreshing latest content posts...</p>
                    </CardContent>
                  </Card>
                ) : personalizedPosts.length === 0 ? (
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
                  <>
                    {personalizedPosts.map((post) => (
                      <TrackedPostCard
                        key={post.id}
                        post={post}
                        onEngagementUpdate={refetch}
                        onEdit={editPost}
                        onDelete={deletePost}
                      />
                    ))}
                    
                    {/* Load More / Loading Indicator */}
                    {hasMore && (
                      <div className="text-center py-6">
                        {loadingPosts ? (
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
                    
                    {!hasMore && personalizedPosts.length > 0 && (
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm">You've seen all the latest posts!</p>
                        <Button variant="ghost" size="sm" className="mt-2" onClick={refreshFeed}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh for new content
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Sidebar - Connections & Insights */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              {/* Who Viewed Profile */}
              <WhoViewedProfile />

              {/* Achievement Badges */}
              <AchievementBadges />

              {/* Power Score */}
              <PowerScoreCard />

              {/* Referral Widget */}
              <ReferralWidget />

              {/* Smart Connections */}
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="truncate">Smart Connections</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={fetchSmartConnections}
                      disabled={loadingConnections}
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingConnections ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  {loadingConnections ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    </div>
                  ) : smartConnections.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">No suggestions available</p>
                      <p className="text-xs text-gray-500">Try refreshing</p>
                    </div>
                  ) : (
                    smartConnections.map((connection) => (
                      <div key={connection.id} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            className="h-10 w-10 shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
                            onClick={() => navigate(`/${connection.username}`)}
                          >
                            <AvatarImage src={connection.avatar_url} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                              {connection.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                              onClick={() => navigate(`/${connection.username}`)}
                            >
                              {connection.full_name || 'Professional User'}
                            </h4>
                            <p className="text-xs text-gray-600 truncate">
                              {connection.current_position || 'Professional'} 
                              {connection.company_name && ` at ${connection.company_name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 pl-13">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs flex-1"
                            onClick={() => sendRequest(connection.id)}
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Connect
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => navigate(`/messages?user=${connection.id}`)}
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
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
                  receivedRequests={receivedRequests}
                  onAcceptRequest={acceptRequest}
                  onRejectRequest={rejectRequest}
                />
              )}

            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      {showScrollTop && window.innerWidth >= 1024 && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

      {/* Mobile/Tablet FAB */}
      <MobileCreatorFAB
        onCreatePost={() => setShowPostCreator(true)}
        onCreateCommunity={() => setShowCommunityCreator(true)}
        onCreateEvent={() => setShowEventCreator(true)}
        onCreateJob={() => setShowJobCreator(true)}
      />

      {/* Full Page Creators */}
      <FullPagePostCreator 
        isOpen={showPostCreator} 
        onClose={() => setShowPostCreator(false)} 
      />
      <FullPageCommunityCreator 
        isOpen={showCommunityCreator} 
        onClose={() => setShowCommunityCreator(false)}
        onSuccess={() => refetch()}
      />
      <FullPageEventCreator 
        isOpen={showEventCreator} 
        onClose={() => setShowEventCreator(false)}
        onSuccess={() => {}}
      />
      <FullPageJobCreator 
        isOpen={showJobCreator} 
        onClose={() => setShowJobCreator(false)}
        onSuccess={() => {}}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
