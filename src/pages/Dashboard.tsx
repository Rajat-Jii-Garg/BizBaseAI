
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
  Rocket,
  MapPin,
  Mail,
  Phone,
  ExternalLink
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();

  // Professional stats with real industry metrics
  const stats = [
    {
      title: "Network Growth",
      value: "1,247",
      change: "+15.3%",
      icon: Users,
      trend: "up",
      color: "bg-blue-500",
      description: "Active connections"
    },
    {
      title: "Profile Engagement",
      value: "3,684",
      change: "+22.1%",
      icon: Eye,
      trend: "up",
      color: "bg-green-500",
      description: "Monthly views"
    },
    {
      title: "Business Opportunities",
      value: "89",
      change: "+31.5%",
      icon: Target,
      trend: "up",
      color: "bg-purple-500",
      description: "Active leads"
    },
    {
      title: "Professional Rating",
      value: "4.8/5.0",
      change: "+0.3",
      icon: Star,
      trend: "up",
      color: "bg-orange-500",
      description: "Client feedback"
    },
  ];

  const professionalActions = [
    { 
      title: "AI Business Advisor", 
      icon: Brain, 
      color: "from-blue-500 to-purple-600", 
      description: "Get strategic business insights",
      action: "Launch Advisor"
    },
    { 
      title: "Smart Networking Hub", 
      icon: Network, 
      color: "from-green-500 to-blue-500", 
      description: "Connect with industry leaders",
      action: "Find Connections"
    },
    { 
      title: "Business Analytics", 
      icon: BarChart3, 
      color: "from-purple-500 to-pink-500", 
      description: "Track your professional growth",
      action: "View Analytics"
    },
    { 
      title: "Industry Insights", 
      icon: TrendingUp, 
      color: "from-orange-500 to-red-500", 
      description: "Market trends and opportunities",
      action: "Get Insights"
    },
    { 
      title: "Live Events & Webinars", 
      icon: Video, 
      color: "from-indigo-500 to-purple-500", 
      description: "Join professional events",
      action: "Browse Events"
    },
    { 
      title: "Skill Development", 
      icon: BookOpen, 
      color: "from-teal-500 to-green-500", 
      description: "Enhance your expertise",
      action: "Start Learning"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Sarah Johnson from Goldman Sachs viewed your profile",
      time: "12 minutes ago",
      user: "Sarah Johnson",
      company: "Goldman Sachs",
      type: "profile_view",
      avatar: null
    },
    {
      id: 2,
      action: "Connected with 5 professionals from Microsoft event",
      time: "1 hour ago",
      user: "Network Expansion",
      company: "Microsoft",
      type: "connection",
      avatar: null
    },
    {
      id: 3,
      action: "New partnership inquiry from TechVentures Inc.",
      time: "3 hours ago",
      user: "TechVentures Inc.",
      company: "Venture Capital",
      type: "business_inquiry",
      avatar: null
    },
    {
      id: 4,
      action: "Your industry analysis post got 127 professional engagements",
      time: "5 hours ago",
      user: "Content Performance",
      company: "LinkedIn Analytics",
      type: "content_engagement",
      avatar: null
    },
    {
      id: 5,
      action: "Invitation to speak at FinTech Summit 2025",
      time: "8 hours ago",
      user: "FinTech Summit",
      company: "Industry Conference",
      type: "speaking_opportunity",
      avatar: null
    }
  ];

  const industryTrends = [
    { topic: "AI in Finance", engagement: "8.7K", trend: "+45%", category: "Technology" },
    { topic: "Sustainable Business", engagement: "6.3K", trend: "+38%", category: "ESG" },
    { topic: "Remote Leadership", engagement: "5.2K", trend: "+29%", category: "Management" },
    { topic: "Digital Transformation", engagement: "4.8K", trend: "+25%", category: "Technology" },
    { topic: "Data Privacy Laws", engagement: "3.9K", trend: "+22%", category: "Legal" },
  ];

  const upcomingEvents = [
    { 
      title: "Global Business Leaders Summit", 
      date: "January 25, 2025", 
      time: "9:00 AM EST", 
      attendees: 2500,
      location: "New York Convention Center",
      type: "In-Person"
    },
    { 
      title: "AI & Future of Work Webinar", 
      date: "January 28, 2025", 
      time: "2:00 PM EST", 
      attendees: 850,
      location: "Virtual Event",
      type: "Online"
    },
    { 
      title: "Sustainable Finance Forum", 
      date: "February 3, 2025", 
      time: "10:30 AM EST", 
      attendees: 420,
      location: "Chicago Business Center",
      type: "Hybrid"
    },
  ];

  const professionalGoals = [
    { goal: "Expand network to 1,500 connections", progress: 83, target: "Q1 2025" },
    { goal: "Complete Advanced Leadership Certification", progress: 65, target: "March 2025" },
    { goal: "Speak at 3 industry conferences", progress: 33, target: "2025" },
    { goal: "Launch consulting practice", progress: 45, target: "Q2 2025" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Professional Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <Crown className="w-8 h-8 mr-3 text-yellow-300" />
                <Badge className="bg-yellow-400/20 text-yellow-100 border-yellow-300/30">
                  Premium Professional
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Professional'}!
              </h1>
              <p className="text-white/90 text-lg mb-4">
                Your professional influence is growing • Ready to make your next big move?
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  Global Professional
                </div>
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <Award className="w-4 h-4 mr-2" />
                  Industry Expert
                </div>
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <Rocket className="w-4 h-4 mr-2" />
                  Growth Leader
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Trophy className="w-16 h-16 text-yellow-300 mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  <span className="font-medium">{stat.change}</span>
                  <span className="text-gray-500 ml-2">this month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Professional Action Center */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-yellow-500" />
                  Professional Action Center
                </CardTitle>
                <p className="text-gray-600">Accelerate your professional growth with AI-powered tools</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {professionalActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`p-6 h-auto flex flex-col gap-4 bg-gradient-to-r ${action.color} text-white border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <action.icon className="w-10 h-10" />
                      <div className="text-center">
                        <div className="font-semibold text-sm mb-2">{action.title}</div>
                        <div className="text-xs opacity-90 mb-3">{action.description}</div>
                        <div className="text-xs bg-black/20 rounded-full px-3 py-1">
                          {action.action}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Professional Goals Progress */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-6 h-6 mr-3 text-blue-600" />
                    Professional Goals 2025
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {professionalGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{goal.goal}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {goal.target}
                          </Badge>
                          <span className="text-sm font-semibold text-blue-600">{goal.progress}%</span>
                        </div>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Creation Hub */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-gray-500 hover:bg-gray-50 h-12 bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200"
                    >
                      <Edit className="w-4 h-4 mr-3" />
                      Share your professional insights and industry expertise...
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t">
                  <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 flex-col h-16">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-xs">Media Post</span>
                  </Button>
                  <Button variant="ghost" className="text-green-600 hover:bg-green-50 flex-col h-16">
                    <BookOpen className="w-5 h-5 mb-1" />
                    <span className="text-xs">Article</span>
                  </Button>
                  <Button variant="ghost" className="text-purple-600 hover:bg-purple-50 flex-col h-16">
                    <Trophy className="w-5 h-5 mb-1" />
                    <span className="text-xs">Achievement</span>
                  </Button>
                  <Button variant="ghost" className="text-orange-600 hover:bg-orange-50 flex-col h-16">
                    <Video className="w-5 h-5 mb-1" />
                    <span className="text-xs">Live Event</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Insights */}
          <div className="space-y-8">
            {/* Professional Activity Feed */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-600" />
                    Professional Activity
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {recentActivity.length} new
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50/50 rounded-lg transition-colors cursor-pointer group">
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-2 rounded-full group-hover:scale-110 transition-transform">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">{activity.action}</p>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <span className="truncate">{activity.company}</span>
                          <span className="mx-2">•</span>
                          <span className="whitespace-nowrap">{activity.time}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:bg-blue-50">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Industry Trends */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  Industry Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {industryTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50/50 rounded-lg cursor-pointer transition-colors group">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-blue-600 truncate">{trend.topic}</p>
                          <Badge variant="outline" className="text-xs">
                            {trend.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{trend.engagement} professionals engaged</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="text-green-600 bg-green-50 border-green-200">
                          {trend.trend}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Professional Events */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Professional Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h4>
                        <Badge variant={event.type === 'Online' ? 'default' : event.type === 'Hybrid' ? 'secondary' : 'outline'} className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date} at {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {event.attendees.toLocaleString()} professionals attending
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-purple-600 hover:bg-purple-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Discover More Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Professional Growth CTA */}
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Rocket className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Accelerate Your Professional Journey</h2>
              <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
                Unlock premium features designed for ambitious professionals. Get AI-powered insights, 
                exclusive networking opportunities, and advanced analytics to stay ahead in your industry.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 h-14"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  AI Business Coach
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 h-14"
                >
                  <Network className="w-5 h-5 mr-2" />
                  Elite Networking
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 h-14"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Advanced Analytics
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 h-14"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Global Opportunities
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
