
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
  Lightbulb
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import SmartPostComposer from '@/components/SmartPostComposer';
import EnhancedPostCard from '@/components/EnhancedPostCard';
import ConnectionsList from '@/components/ConnectionsList';
import AINetworkingAssistant from '@/components/AINetworkingAssistant';
import { usePosts } from '@/hooks/usePosts';
import { useConnections } from '@/hooks/useConnections';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [suggestedConnections, setSuggestedConnections] = useState<any[]>([]);
  
  const { 
    posts, 
    loading: postsLoading, 
    createPost, 
    toggleLike, 
    sharePost 
  } = usePosts();
  
  const { 
    connections, 
    pendingRequests, 
    loading: connectionsLoading,
    respondToRequest 
  } = useConnections();

  // Fetch suggested connections
  useEffect(() => {
    if (user) {
      fetchSuggestedConnections();
    }
  }, [user]);

  const fetchSuggestedConnections = async () => {
    try {
      // Get profiles excluding current user and existing connections
      const { data: connectedUserIds } = await supabase
        .from('connections')
        .select('addressee_id, requester_id')
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`);

      const excludeIds = [
        user?.id,
        ...(connectedUserIds?.map(conn => 
          conn.requester_id === user?.id ? conn.addressee_id : conn.requester_id
        ) || [])
      ];

      const { data: suggestions, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .not('full_name', 'is', null)
        .limit(5);

      if (error) throw error;
      setSuggestedConnections(suggestions || []);
    } catch (error) {
      console.error('Error fetching suggested connections:', error);
    }
  };

  const profileStats = [
    { label: "Profile Views", value: "1,247", change: "+15.3%", icon: Eye, color: "text-blue-600" },
    { label: "Post Reach", value: "8,934", change: "+22.1%", icon: BarChart3, color: "text-green-600" },
    { label: "Engagement", value: "456", change: "+8.7%", icon: TrendingUp, color: "text-purple-600" },
    { label: "Network Growth", value: "89", change: "+12.4%", icon: Users, color: "text-orange-600" },
  ];

  const quickActions = [
    { label: "Create Post", icon: Plus, action: () => {}, color: "bg-blue-600" },
    { label: "Find Connections", icon: UserPlus, action: () => {}, color: "bg-green-600" },
    { label: "AI Insights", icon: Brain, action: () => {}, color: "bg-purple-600" },
    { label: "Analytics", icon: BarChart3, action: () => {}, color: "bg-orange-600" },
  ];

  const handleAcceptRequest = (connectionId: string) => {
    respondToRequest(connectionId, 'accepted');
  };

  const handleRejectRequest = (connectionId: string) => {
    respondToRequest(connectionId, 'rejected');  
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleSuggestConnection = (profileId: string) => {
    console.log('Connecting to profile:', profileId);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* AI Welcome Banner */}
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
                        Welcome to BizBase AI, {user?.user_metadata?.full_name?.split(' ')[0] || 'Professional'}!
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
              {/* Enhanced Profile Card */}
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <CardContent className="p-6 text-center relative">
                  <Avatar className="h-20 w-20 mx-auto -mt-12 mb-4 ring-4 ring-white shadow-xl">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold text-xl">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">
                    {user?.user_metadata?.full_name || 'Professional User'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    AI-Enhanced Profile
                  </p>
                  <div className="flex justify-center gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{connections.length}</div>
                      <div className="text-xs text-gray-500">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{posts.length}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">92%</div>
                      <div className="text-xs text-gray-500">AI Score</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleViewProfile}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
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
                          <p className="text-xs text-gray-500">This week</p>
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

              {/* Quick Actions */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center p-4 h-auto space-y-2 hover:shadow-md transition-all"
                      onClick={action.action}
                    >
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Feed */}
            <div className="lg:col-span-6 space-y-6">
              {/* Smart Post Composer */}
              <SmartPostComposer onCreatePost={createPost} />

              {/* Posts Feed */}
              <div className="space-y-6">
                {postsLoading ? (
                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-12 text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600 text-lg">Loading your personalized feed...</p>
                    </CardContent>
                  </Card>
                ) : posts.length === 0 ? (
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
                  posts.map((post) => (
                    <EnhancedPostCard
                      key={post.id}
                      post={post}
                      onLike={toggleLike}
                      onShare={sharePost}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar - Connections & Insights */}
            <div className="lg:col-span-3 space-y-6">
              {/* AI Networking Assistant */}
              <AINetworkingAssistant onSuggestConnection={handleSuggestConnection} />

              {/* Connections */}
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

              {/* Industry Insights */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Industry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Revolution in Business
                      </h5>
                      <p className="text-xs text-blue-700 mb-2">8,234 professionals discussing</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Trending Now</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="text-sm font-semibold text-purple-900 mb-1">
                        Future of Remote Work
                      </h5>
                      <p className="text-xs text-purple-700 mb-2">5,678 professionals discussing</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs text-orange-600 font-medium">Hot Topic</span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="text-sm font-semibold text-green-900 mb-1">
                        Sustainable Innovation
                      </h5>
                      <p className="text-xs text-green-700 mb-2">3,421 professionals discussing</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-blue-600 font-medium">Growing</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Goals Tracker */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    AI Goals Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Network Growth</span>
                        <span className="text-sm font-bold text-purple-600">83%</span>
                      </div>
                      <Progress value={83} className="h-2 bg-purple-100" />
                      <p className="text-xs text-gray-500 mt-1">12 new connections this month</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Content Engagement</span>
                        <span className="text-sm font-bold text-blue-600">91%</span>
                      </div>
                      <Progress value={91} className="h-2 bg-blue-100" />
                      <p className="text-xs text-gray-500 mt-1">Excellent post performance</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Profile Optimization</span>
                        <span className="text-sm font-bold text-green-600">76%</span>
                      </div>
                      <Progress value={76} className="h-2 bg-green-100" />
                      <p className="text-xs text-gray-500 mt-1">Add more skills to improve</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-white/80 hover:bg-white">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    Get AI Recommendations
                  </Button>
                </CardContent>
              </Card>

              {/* Learning Resources */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Learning Hub
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">AI in Professional Networking</h5>
                    <p className="text-xs text-gray-600 mb-2">5 min read • Trending</p>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600">Earn Certificate</span>
                    </div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Building Your Digital Brand</h5>
                    <p className="text-xs text-gray-600 mb-2">8 min read • Popular</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600">Join Discussion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
