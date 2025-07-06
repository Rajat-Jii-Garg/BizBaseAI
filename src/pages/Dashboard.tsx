
import React, { useState } from "react";
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
  Loader2
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import PostCreator from '@/components/PostCreator';
import PostCard from '@/components/PostCard';
import ConnectionsList from '@/components/ConnectionsList';
import { usePosts } from '@/hooks/usePosts';
import { useConnections } from '@/hooks/useConnections';

const Dashboard = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg relative">
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
                <h2 className="text-xl font-semibold mb-1">
                  Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Professional'}!
                </h2>
                <p className="text-white/90 text-sm">
                  Ready to connect and grow your professional network?
                </p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-300" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <Card className="bg-white shadow-sm border border-gray-200">
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
                <p className="text-sm text-gray-600 mb-3">Premium Member</p>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">Analytics</CardTitle>
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
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Post Creator */}
            <PostCreator onCreatePost={createPost} />

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
                    <p className="text-gray-600 mb-4">No posts yet. Create your first post to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard
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
            {/* Industry News */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Industry News
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                    AI transforms business operations
                  </h5>
                  <p className="text-xs text-gray-600">8,234 professionals talking about this</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                    Remote work trends in 2025
                  </h5>
                  <p className="text-xs text-gray-600">5,678 professionals talking about this</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                    Sustainable business practices
                  </h5>
                  <p className="text-xs text-gray-600">3,421 professionals talking about this</p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-900">Tech Leadership Summit</h5>
                  <p className="text-xs text-gray-600">January 25, 2025</p>
                  <p className="text-xs text-gray-500">2,500+ attending</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-900">AI & Future of Work</h5>
                  <p className="text-xs text-gray-600">January 28, 2025</p>
                  <p className="text-xs text-gray-500">850+ attending</p>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs h-7">
                  <Plus className="w-3 h-3 mr-1" />
                  Discover Events
                </Button>
              </CardContent>
            </Card>

            {/* Professional Goals */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Goals 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Network Growth</span>
                    <span className="text-xs font-semibold text-blue-600">83%</span>
                  </div>
                  <Progress value={83} className="h-1" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700">Skill Development</span>
                    <span className="text-xs font-semibold text-blue-600">65%</span>
                  </div>
                  <Progress value={65} className="h-1" />
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs h-7">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Goal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
