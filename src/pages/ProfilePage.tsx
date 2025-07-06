
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  TrendingUp, 
  Target, 
  Award, 
  Brain,
  Zap,
  Trophy,
  CheckCircle,
  ArrowUp,
  Edit,
  Camera,
  MapPin,
  Briefcase,
  Users,
  Eye,
  Crown,
  Rocket,
  Building2,
  Calendar,
  Globe,
  Mail,
  Phone,
  Share2,
  Download,
  Settings,
  Plus,
  Heart,
  MessageCircle,
  BookOpen,
  Lightbulb,
  Coffee,
  Code,
  Palette,
  Music,
  Mountain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample enhanced data (in real app, this would come from database)
  const [profileScore] = useState(92);
  const [networkStrength] = useState(88);
  const [contentQuality] = useState(85);
  const [engagement] = useState(94);

  const skillsData = [
    { skill: 'Leadership & Strategy', progress: 95, category: 'Management', trending: true },
    { skill: 'Full Stack Development', progress: 90, category: 'Technical', trending: true },
    { skill: 'AI & Machine Learning', progress: 85, category: 'Technical', trending: true },
    { skill: 'Business Development', progress: 82, category: 'Business', trending: false },
    { skill: 'Team Management', progress: 88, category: 'Management', trending: true },
    { skill: 'Digital Marketing', progress: 78, category: 'Marketing', trending: false }
  ];

  const achievements = [
    { title: 'Innovation Pioneer', icon: Rocket, color: 'text-purple-600', description: 'Led 5+ breakthrough projects' },
    { title: 'Mentor Elite', icon: Star, color: 'text-blue-600', description: 'Mentored 50+ professionals' },
    { title: 'Tech Visionary', icon: Brain, color: 'text-green-600', description: 'AI implementation expert' },
    { title: 'Community Builder', icon: Users, color: 'text-orange-600', description: 'Built network of 5K+' },
    { title: 'Thought Leader', icon: Lightbulb, color: 'text-yellow-600', description: '100+ published insights' },
    { title: 'Global Impact', icon: Globe, color: 'text-indigo-600', description: 'International recognition' }
  ];

  const projects = [
    { 
      title: 'AI-Powered Business Platform', 
      description: 'Revolutionary platform using AI for business optimization',
      tech: ['React', 'Node.js', 'TensorFlow', 'AWS'],
      status: 'Live',
      impact: '10M+ users'
    },
    { 
      title: 'Sustainable Tech Initiative', 
      description: 'Green technology solutions for enterprise clients',
      tech: ['Python', 'Django', 'Solar API', 'IoT'],
      status: 'In Progress',
      impact: '50% energy reduction'
    },
    { 
      title: 'Community Learning Hub', 
      description: 'Open-source platform for skill development',
      tech: ['Vue.js', 'Firebase', 'GraphQL'],
      status: 'Completed',
      impact: '25K+ learners'
    }
  ];

  const interests = [
    { name: 'Artificial Intelligence', icon: Brain, count: 1250 },
    { name: 'Sustainable Technology', icon: Mountain, count: 890 },
    { name: 'Creative Design', icon: Palette, count: 670 },
    { name: 'Music Production', icon: Music, count: 450 },
    { name: 'Coding', icon: Code, count: 2100 },
    { name: 'Coffee Culture', icon: Coffee, count: 320 }
  ];

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
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Hero Profile Section */}
        <Card className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white border-0 shadow-2xl overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-white/20 shadow-2xl">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-4xl font-bold">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon"
                    className="absolute -bottom-2 -right-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full h-10 w-10"
                  >
                    <Camera className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold">
                      {profile?.full_name || 'Professional User'}
                    </h1>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                      <Crown className="w-4 h-4 mr-1" />
                      Elite Pro
                    </Badge>
                  </div>
                  
                  <p className="text-xl text-white/90 mb-4">
                    Senior Full Stack Developer & AI Innovation Specialist
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-white/80 mb-6">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      {profile?.company_name || 'Tech Innovators Inc'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Mumbai, India
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      5+ Years Experience
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      3.2K+ Connections
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </Button>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      <Download className="w-4 h-4 mr-2" />
                      Download CV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills & Analytics</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Professional Score */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Professional Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-blue-600 mb-2">{profileScore}</div>
                    <div className="flex items-center justify-center text-sm text-green-600">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +15 points this month
                    </div>
                  </div>
                  <Progress value={profileScore} className="h-3 mb-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Network Strength</span>
                      <span className="font-semibold">{networkStrength}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content Quality</span>
                      <span className="font-semibold">{contentQuality}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engagement Rate</span>
                      <span className="font-semibold">{engagement}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Eye className="w-5 h-5 mr-2" />
                    Profile Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profile Views</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">2,847</span>
                      <div className="text-xs text-green-500">+23% this week</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Search Appearances</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">1,256</span>
                      <div className="text-xs text-blue-500">+18% this week</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Post Impressions</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-purple-600">8,934</span>
                      <div className="text-xs text-purple-500">+45% this week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Social */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-800">
                    <Mail className="w-5 h-5 mr-2" />
                    Connect & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-3" />
                    {user?.email}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-3" />
                    +91 98765 43210
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Globe className="w-4 h-4 mr-3" />
                    www.portfolio.com
                  </Button>
                  <div className="pt-3 border-t">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-indigo-600" />
                    Professional Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillsData.map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{skill.skill}</span>
                            <Badge variant="outline" className="text-xs">
                              {skill.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{skill.progress}%</span>
                            {skill.trending && (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    AI Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Skill Growth Opportunity</h4>
                    <p className="text-sm text-blue-700">Focus on Cloud Architecture to boost your profile score by 12%</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Trending Skills</h4>
                    <p className="text-sm text-green-700">AI/ML skills are trending in your network. Consider showcasing more projects.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Network Recommendation</h4>
                    <p className="text-sm text-purple-700">Connect with 3 more AI specialists to strengthen your network.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                      </div>
                      <Badge 
                        variant={project.status === 'Live' ? 'default' : project.status === 'In Progress' ? 'secondary' : 'outline'}
                        className="ml-4"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{project.impact}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm">
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-6 text-center">
                    <achievement.icon className={`w-12 h-12 mx-auto mb-4 ${achievement.color}`} />
                    <h3 className="text-lg font-bold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Trophy className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interests.map((interest, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <interest.icon className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{interest.name}</h4>
                          <p className="text-xs text-gray-500">{interest.count} followers</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Network Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Connections</span>
                    <span className="font-bold text-2xl text-blue-600">3,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mutual Connections</span>
                    <span className="font-bold text-xl text-green-600">1,856</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Industry Leaders</span>
                    <span className="font-bold text-xl text-purple-600">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Global Reach</span>
                    <span className="font-bold text-xl text-orange-600">34 Countries</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-green-600" />
                    Global Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Your Influence Score</h4>
                    <div className="text-3xl font-bold text-purple-600">9.2/10</div>
                    <p className="text-sm text-gray-600">Top 1% in your industry</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Content Reach</span>
                      <span className="font-semibold">2.5M+ impressions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Engagement Rate</span>
                      <span className="font-semibold">8.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
