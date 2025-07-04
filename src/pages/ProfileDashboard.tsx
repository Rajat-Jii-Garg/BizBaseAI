
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  MapPin, 
  Calendar,
  Users,
  Briefcase,
  Plus,
  Settings,
  Bell,
  MessageSquare,
  TrendingUp,
  Star,
  BookOpen,
  Award,
  Globe,
  Eye,
  Heart,
  Share2,
  Send,
  Camera,
  Edit,
  Network,
  Zap,
  Target,
  Rocket,
  Crown,
  Trophy,
  CheckCircle,
  ArrowUp,
  ChevronRight,
  Brain,
  Home,
  Coffee,
  Video
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedProfile from '@/components/EnhancedProfile';
import SmartNetworking from '@/components/SmartNetworking';
import ProfessionalTools from '@/components/ProfessionalTools';

const ProfileDashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
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
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sample data for professional networking features
  const networkStats = {
    connections: 1247,
    profileViews: 89,
    searchAppearances: 156,
    impressions: 2340
  };

  const suggestedConnections = [
    { name: "Rahul Sharma", title: "Full Stack Developer", company: "TechCorp", mutualConnections: 12 },
    { name: "Priya Singh", title: "Product Manager", company: "InnovateLab", mutualConnections: 8 },
    { name: "Amit Kumar", title: "DevOps Engineer", company: "CloudTech", mutualConnections: 15 }
  ];

  const recentActivity = [
    { user: "Neha Gupta", action: "liked your post", time: "2h ago" },
    { user: "Vikash Yadav", action: "commented on your article", time: "4h ago" },
    { user: "Sarah Johnson", action: "viewed your profile", time: "6h ago" },
    { user: "Tech Weekly", action: "featured your project", time: "1d ago" }
  ];

  const trendingTopics = [
    "#ReactJS", "#NodeJS", "#WebDevelopment", "#AI", "#Blockchain", "#Startup"
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="networking" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Smart Network
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Pro Tools
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left Sidebar - Enhanced Profile */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <div className="relative">
                    <div className="h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-lg"></div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-white hover:bg-white/20"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-6 -mt-10 relative">
                    <div className="text-center">
                      <div className="relative">
                        <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-white shadow-lg">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xl font-bold">
                            {profile?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute bottom-0 right-0 bg-white shadow-md hover:shadow-lg w-8 h-8 rounded-full"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {profile?.full_name || 'Professional User'}
                      </h2>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Full Stack Developer & Tech Enthusiast
                      </p>

                      <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        Mumbai, India
                      </div>

                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro Member
                        </Badge>
                        {profile?.email_verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Network Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Profile Views</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-blue-600">{networkStats.profileViews}</span>
                          <ArrowUp className="w-3 h-3 text-green-500" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Connections</span>
                        <span className="font-semibold text-purple-600">{networkStats.connections}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Impressions</span>
                        <span className="font-semibold text-pink-600">{networkStats.impressions}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                      Trending Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {trendingTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <span className="text-sm font-medium text-blue-600">{topic}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Welcome Section */}
                <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <Rocket className="w-12 h-12 mx-auto mb-4 text-white/90" />
                      <h1 className="text-3xl font-bold mb-3">
                        Welcome to ProConnect, {profile?.full_name?.split(' ')[0] || 'Professional'}! 🚀
                      </h1>
                      <p className="text-white/90 mb-6 text-lg">
                        Your professional networking platform with advanced features and AI-powered connections.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          variant="secondary"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                          onClick={() => setActiveTab('networking')}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Find Connections
                        </Button>
                        
                        <Button 
                          variant="secondary"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                          onClick={() => setActiveTab('tools')}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          AI Networking
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Post Creation */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                          {profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-gray-500 hover:bg-gray-50 h-12 bg-gray-50/50"
                        >
                          Share your professional thoughts...
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
                        <Camera className="w-4 h-4 mr-2" />
                        Photo
                      </Button>
                      <Button variant="ghost" className="text-green-600 hover:bg-green-50">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Article
                      </Button>
                      <Button variant="ghost" className="text-purple-600 hover:bg-purple-50">
                        <Trophy className="w-4 h-4 mr-2" />
                        Achievement
                      </Button>
                      <Button variant="ghost" className="text-orange-600 hover:bg-orange-50">
                        <Target className="w-4 h-4 mr-2" />
                        Poll
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Feed */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-blue-600" />
                        Professional Feed
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50/50 rounded-lg transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                              {activity.user.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold">{activity.user}</span>
                              <span className="text-gray-600 ml-1">{activity.action}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                                <Heart className="w-4 h-4 mr-1" />
                                Like
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Comment
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600">
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Suggested Connections */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-600" />
                        People You May Know
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('networking')}>
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestedConnections.map((person, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                              {person.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{person.name}</p>
                            <p className="text-xs text-gray-600">{person.title}</p>
                            <p className="text-xs text-gray-500">{person.mutualConnections} mutual connections</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Professional Tools */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                      Professional Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setActiveTab('tools')}
                    >
                      <Star className="w-4 h-4 mr-3" />
                      AI Career Advisor
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm hover:bg-green-50 hover:text-green-600"
                      onClick={() => setActiveTab('tools')}
                    >
                      <Target className="w-4 h-4 mr-3" />
                      Skill Matcher
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => setActiveTab('tools')}
                    >
                      <Award className="w-4 h-4 mr-3" />
                      Certification Hub
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => setActiveTab('tools')}
                    >
                      <Rocket className="w-4 h-4 mr-3" />
                      Startup Incubator
                    </Button>
                  </CardContent>
                </Card>

                {/* Platform Stats */}
                <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Trophy className="w-4 h-4 mr-2 text-purple-600" />
                      Platform Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Active Professionals</span>
                      <span className="font-bold text-purple-600">50K+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Success Stories</span>
                      <span className="font-bold text-green-600">5,200+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">AI Connections Made</span>
                      <span className="font-bold text-blue-600">25K+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Job Placements</span>
                      <span className="font-bold text-orange-600">3,800+</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <EnhancedProfile profile={profile} />
          </TabsContent>

          <TabsContent value="networking">
            <SmartNetworking />
          </TabsContent>

          <TabsContent value="tools">
            <ProfessionalTools />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white/90" />
                  <h1 className="text-3xl font-bold mb-3">Professional Insights</h1>
                  <p className="text-white/90 text-lg">
                    Advanced analytics and insights for your professional growth
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Career Trajectory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">Upward</div>
                  <p className="text-sm text-gray-600">Your career is trending positively with 15% growth this quarter</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Market Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">Top 10%</div>
                  <p className="text-sm text-gray-600">You rank in the top 10% of professionals in your field</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Influence Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">8.7/10</div>
                  <p className="text-sm text-gray-600">Your professional influence is exceptionally strong</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfileDashboard;
