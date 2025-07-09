
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
  Sparkles
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
    { label: "Profile Views", value: "1,247", change: "+15.3%", icon: Eye },
    { label: "Post Impressions", value: "8,934", change: "+22.1%", icon: BarChart3 },
    { label: "Search Appearances", value: "456", change: "+8.7%", icon: TrendingUp },
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
          {/* Welcome Banner */}
          {showWelcome && (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg relative mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full h-6 w-6"
                onClick={() => setShowWelcome(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-between pr-8">
                <div>
                  <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Welcome to BizBase AI, {user?.user_metadata?.full_name?.split(' ')[0] || 'Professional'}!
                  </h2>
                  <p className="text-white/90 text-sm">
                    🚀 Experience next-gen professional networking with AI-powered insights
                  </p>
                </div>
                <Brain className="w-12 h-12 text-purple-300" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Enhanced Profile Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl border-0">
                <CardContent className="p-4 text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-blue-200">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {user?.user_metadata?.full_name || 'Professional User'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 flex items-center justify-center gap-1">
                    <Brain className="w-3 h-3" />
                    AI-Enhanced Profile
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={handleViewProfile}
                  >
                    <User className="w-3 h-3 mr-1" />
                    View Smart Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    AI Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {profileStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <stat.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">{stat.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-green-600">{stat.change}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Networking Assistant */}
              <AINetworkingAssistant onSuggestConnection={handleSuggestConnection} />
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Smart Post Composer */}
              <SmartPostComposer onCreatePost={createPost} />

              {/* Posts Feed */}
              <div className="space-y-4">
                {postsLoading ? (
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardContent className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading posts...</p>
                    </CardContent>
                  </Card>
                ) : posts.length === 0 ? (
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-400 mb-4">
                        <Brain className="w-16 h-16 mx-auto mb-4" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to BizBase AI!</h3>
                      <p className="text-gray-600 mb-4">Start your AI-powered professional journey! Create your first post to connect with other professionals.</p>
                      <p className="text-sm text-gray-500">✨ Use AI suggestions to create engaging content</p>
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

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Connections */}
              {connectionsLoading ? (
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-4 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
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

              {/* Industry Trends */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    AI Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-900 hover:text-blue-600 cursor-pointer flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      AI transforms business operations
                    </h5>
                    <p className="text-xs text-gray-600">8,234 professionals discussing</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                      Future of remote collaboration
                    </h5>
                    <p className="text-xs text-gray-600">5,678 professionals discussing</p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                      Sustainable business innovation
                    </h5>
                    <p className="text-xs text-gray-600">3,421 professionals discussing</p>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Goals */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    AI Goals Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-700">Network Expansion</span>
                      <span className="text-xs font-semibold text-blue-600">83%</span>
                    </div>
                    <Progress value={83} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-700">Content Engagement</span>
                      <span className="text-xs font-semibold text-blue-600">91%</span>
                    </div>
                    <Progress value={91} className="h-1" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs h-7">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Insights
                  </Button>
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
