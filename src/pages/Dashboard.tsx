
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Star,
  Target,
  Award,
  Brain,
  Zap,
  Trophy,
  Crown,
  Network,
  Eye,
  Heart,
  Share2,
  Plus,
  ArrowUp,
  Briefcase,
  Globe,
  Coffee,
  Video,
  BookOpen,
  Camera,
  ChevronRight,
  Building2,
  Lightbulb,
  Rocket,
  MapPin,
  X,
  Send,
  Image,
  FileText,
  Link,
  Smile,
  Hash,
  AtSign,
  MessageCircle,
  Repeat2,
  MoreHorizontal,
  ThumbsUp
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Textarea } from "@/components/ui/textarea";

const Dashboard = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [postContent, setPostContent] = useState('');

  // Sample posts data for LinkedIn-style feed
  const posts = [
    {
      id: 1,
      author: {
        name: "Sarah Johnson",
        title: "Senior Marketing Director at TechCorp",
        avatar: "/placeholder.svg",
        verified: true
      },
      content: "Excited to announce our Q4 results! Our team achieved 150% of our growth targets. Key learnings: 1) Customer-centric approach works 2) Data-driven decisions are crucial 3) Team collaboration is everything. What strategies have worked best for your team this quarter?",
      timestamp: "2h",
      engagement: {
        likes: 127,
        comments: 23,
        shares: 8
      },
      image: null
    },
    {
      id: 2,
      author: {
        name: "Michael Chen",
        title: "Founder & CEO at StartupHub",
        avatar: "/placeholder.svg",
        verified: false
      },
      content: "Just wrapped up an incredible investor meeting! 🚀 The future of B2B SaaS is bright. Three key trends I'm seeing: AI integration, enhanced user experience, and sustainable business models. #StartupLife #Innovation",
      timestamp: "4h",
      engagement: {
        likes: 89,
        comments: 15,
        shares: 12
      },
      image: null
    },
    {
      id: 3,
      author: {
        name: "Emily Rodriguez",
        title: "VP of Engineering at DataFlow Systems",
        avatar: "/placeholder.svg",
        verified: true
      },
      content: "Celebrating our engineering team's latest achievement - we've successfully reduced our API response time by 40%! This optimization will directly impact user experience across all our platforms. Proud of the dedication and technical excellence of our team. #Engineering #Performance",
      timestamp: "6h",
      engagement: {
        likes: 156,
        comments: 31,
        shares: 6
      },
      image: null
    }
  ];

  const profileStats = [
    { label: "Profile Views", value: "1,247", change: "+15.3%", icon: Eye },
    { label: "Post Impressions", value: "8,934", change: "+22.1%", icon: BarChart3 },
    { label: "Search Appearances", value: "456", change: "+8.7%", icon: TrendingUp },
  ];

  const handlePost = () => {
    if (postContent.trim()) {
      console.log('Posting:', postContent);
      setPostContent('');
    }
  };

  const handlePostEngagement = (postId: number, action: string) => {
    console.log(`${action} on post ${postId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Banner - More compact */}
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
          {/* Left Sidebar - Profile Stats */}
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

            {/* Profile Analytics */}
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

            {/* Quick Actions */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                  <Users className="w-4 h-4 mr-2" />
                  Find Connections
                </Button>
                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upcoming Events
                </Button>
                <Button variant="ghost" className="w-full justify-start text-xs h-8">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Job Opportunities
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Compact Post Creation */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your professional thoughts..."
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px] text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-8 px-2">
                      <Image className="w-4 h-4 mr-1" />
                      <span className="text-xs">Photo</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 h-8 px-2">
                      <Video className="w-4 h-4 mr-1" />
                      <span className="text-xs">Video</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50 h-8 px-2">
                      <FileText className="w-4 h-4 mr-1" />
                      <span className="text-xs">Article</span>
                    </Button>
                  </div>
                  <Button 
                    onClick={handlePost}
                    disabled={!postContent.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 h-8 px-4"
                  >
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{post.author.name}</h4>
                            {post.author.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{post.author.title}</p>
                          <p className="text-xs text-gray-500">{post.timestamp}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
                    </div>

                    {/* Post Engagement */}
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span>{post.engagement.likes} likes</span>
                          <span>{post.engagement.comments} comments</span>
                          <span>{post.engagement.shares} shares</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-around border-t border-gray-100 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 h-8 hover:bg-gray-50"
                          onClick={() => handlePostEngagement(post.id, 'like')}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          <span className="text-xs">Like</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 h-8 hover:bg-gray-50"
                          onClick={() => handlePostEngagement(post.id, 'comment')}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs">Comment</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 h-8 hover:bg-gray-50"
                          onClick={() => handlePostEngagement(post.id, 'share')}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          <span className="text-xs">Share</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar - News & Trends */}
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
