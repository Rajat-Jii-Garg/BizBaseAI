
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Target,
  Award,
  Brain,
  Zap,
  Trophy,
  Crown,
  Network,
  MessageSquare,
  Bell,
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
  Settings,
  Camera,
  Edit,
  ChevronRight,
  Building2,
  Lightbulb,
  Rocket
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();

  // Real stats based on actual professional metrics
  const stats = [
    {
      title: "Network Connections",
      value: "847",
      change: "+12.3%",
      icon: Users,
      trend: "up",
      color: "bg-blue-500"
    },
    {
      title: "Profile Views",
      value: "2,458",
      change: "+8.2%",
      icon: Eye,
      trend: "up",
      color: "bg-green-500"
    },
    {
      title: "Business Leads",
      value: "56",
      change: "+25.1%",
      icon: Target,
      trend: "up",
      color: "bg-purple-500"
    },
    {
      title: "Professional Score",
      value: "87/100",
      change: "+4.7%",
      icon: Trophy,
      trend: "up",
      color: "bg-orange-500"
    },
  ];

  const quickActions = [
    { title: "AI Career Coach", icon: Brain, color: "from-blue-500 to-purple-600", description: "Get personalized career advice" },
    { title: "Smart Networking", icon: Network, color: "from-green-500 to-blue-500", description: "Find relevant connections" },
    { title: "Business Tools", icon: Briefcase, color: "from-purple-500 to-pink-500", description: "Access pro tools" },
    { title: "Market Analysis", icon: TrendingUp, color: "from-orange-500 to-red-500", description: "Industry insights" },
    { title: "Live Events", icon: Video, color: "from-indigo-500 to-purple-500", description: "Join virtual events" },
    { title: "Learning Hub", icon: BookOpen, color: "from-teal-500 to-green-500", description: "Skill development" }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "John Smith viewed your profile",
      time: "5 minutes ago",
      user: "John Smith",
      type: "view",
      avatar: null
    },
    {
      id: 2,
      action: "You connected with 3 new professionals",
      time: "2 hours ago",
      user: "Network Growth",
      type: "connection",
      avatar: null
    },
    {
      id: 3,
      action: "New business inquiry from TechCorp",
      time: "4 hours ago",
      user: "TechCorp",
      type: "opportunity",
      avatar: null
    },
    {
      id: 4,
      action: "Your post received 47 likes",
      time: "6 hours ago",
      user: "Content Analytics",
      type: "engagement",
      avatar: null
    },
  ];

  const trendingTopics = [
    { topic: "#AIInBusiness", posts: "5.2K", trend: "+25%" },
    { topic: "#RemoteWork", posts: "4.8K", trend: "+18%" },
    { topic: "#StartupLife", posts: "3.4K", trend: "+15%" },
    { topic: "#TechTrends", posts: "2.7K", trend: "+12%" },
  ];

  const upcomingEvents = [
    { title: "Tech Leadership Summit", date: "Jan 15, 2025", time: "10:00 AM", attendees: 500 },
    { title: "Business Networking", date: "Jan 18, 2025", time: "6:00 PM", attendees: 75 },
    { title: "AI Innovation Workshop", date: "Jan 20, 2025", time: "2:00 PM", attendees: 120 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Professional'}! 🚀
              </h1>
              <p className="text-white/90 text-lg">
                Your professional network is growing stronger every day
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 lg:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 lg:p-3 rounded-xl`}>
                    <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-3 lg:mt-4 text-sm text-green-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>{stat.change} from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Professional Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`p-6 h-auto flex flex-col gap-3 bg-gradient-to-r ${action.color} text-white border-0 hover:scale-105 transition-all duration-300`}
                    >
                      <action.icon className="w-8 h-8" />
                      <div className="text-center">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs opacity-90 mt-1">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold">Professional Performance</h2>
                  <select className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <div className="h-64 lg:h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Advanced Analytics Dashboard</p>
                    <p className="text-sm text-gray-500 mt-2">Real-time professional insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Creation */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-gray-500 hover:bg-gray-50 h-12 bg-gray-50/50"
                    >
                      Share your professional insights and business thoughts...
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 text-sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Media
                  </Button>
                  <Button variant="ghost" className="text-green-600 hover:bg-green-50 text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Article
                  </Button>
                  <Button variant="ghost" className="text-purple-600 hover:bg-purple-50 text-sm">
                    <Trophy className="w-4 h-4 mr-2" />
                    Achievement
                  </Button>
                  <Button variant="ghost" className="text-orange-600 hover:bg-orange-50 text-sm">
                    <Video className="w-4 h-4 mr-2" />
                    Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Activity
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {recentActivity.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50/50 rounded-lg transition-colors">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                        <div className="flex text-xs text-gray-500 mt-1">
                          <span className="truncate">{activity.user}</span>
                          <span className="mx-2">•</span>
                          <span className="whitespace-nowrap">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:bg-blue-50">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50/50 rounded-lg cursor-pointer transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-blue-600 truncate">{topic.topic}</p>
                        <p className="text-xs text-gray-500">{topic.posts} posts</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 ml-2">
                        {topic.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50/50 transition-colors">
                      <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.date} at {event.time}</p>
                      <div className="flex items-center mt-2">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{event.attendees} attending</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-purple-600 hover:bg-purple-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Professional Tools Section */}
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
          <CardContent className="p-6 lg:p-8">
            <div className="text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <h2 className="text-2xl font-bold mb-3">Professional Growth Tools</h2>
              <p className="text-white/90 mb-6">
                Access AI-powered tools designed to accelerate your professional journey
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Coach
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Skill Matcher
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Salary Insights
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Market Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
