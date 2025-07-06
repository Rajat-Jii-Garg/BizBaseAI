
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Search, 
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Target,
  Award,
  Zap,
  Brain,
  Globe,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Star,
  Building2,
  Briefcase,
  Network,
  ChevronRight,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Insights = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const profileMetrics = {
    profileViews: { value: 3684, change: 22.1, trend: 'up' },
    searchAppearances: { value: 1247, change: 15.3, trend: 'up' },
    postImpressions: { value: 8932, change: 31.5, trend: 'up' },
    engagementRate: { value: 7.8, change: 0.8, trend: 'up' }
  };

  const contentPerformance = [
    {
      id: 1,
      title: "Digital Marketing Trends for 2025",
      type: "Article",
      views: 2845,
      likes: 156,
      comments: 23,
      shares: 18,
      engagement: 6.8,
      publishDate: "2 days ago",
      performance: "excellent"
    },
    {
      id: 2,
      title: "AI in Business: A Practical Guide",
      type: "Post",
      views: 1923,
      likes: 89,
      comments: 12,
      shares: 7,
      engagement: 5.6,
      publishDate: "1 week ago",
      performance: "good"
    },
    {
      id: 3,
      title: "Leadership Lessons from Tech Giants",
      type: "Video",
      views: 1456,
      likes: 67,
      comments: 8,
      shares: 4,
      engagement: 5.4,
      publishDate: "2 weeks ago",
      performance: "good"
    },
    {
      id: 4,
      title: "Remote Work Productivity Tips",
      type: "Post",
      views: 892,
      likes: 34,
      comments: 5,
      shares: 2,
      engagement: 4.6,
      publishDate: "3 weeks ago",
      performance: "average"
    }
  ];

  const networkInsights = [
    {
      category: "Industry Leaders",
      count: 124,
      growth: 12,
      topConnections: ["Tech Executives", "Marketing Directors", "Product Managers"]
    },
    {
      category: "Potential Collaborators",
      count: 67,
      growth: 8,
      topConnections: ["Consultants", "Freelancers", "Agency Owners"]
    },
    {
      category: "Industry Peers",
      count: 234,
      growth: 15,
      topConnections: ["Marketing Specialists", "Business Analysts", "Sales Professionals"]
    },
    {
      category: "Thought Leaders",
      count: 89,
      growth: 21,
      topConnections: ["Authors", "Speakers", "Industry Experts"]
    }
  ];

  const industryTrends = [
    { topic: "Artificial Intelligence", engagement: 12400, trend: 45, category: "Technology" },
    { topic: "Sustainable Business", engagement: 9800, trend: 38, category: "ESG" },
    { topic: "Remote Leadership", engagement: 7600, trend: 29, category: "Management" },
    { topic: "Digital Transformation", engagement: 6800, trend: 25, category: "Technology" },
    { topic: "Customer Experience", engagement: 5400, trend: 22, category: "Marketing" },
    { topic: "Data Privacy", engagement: 4200, trend: 18, category: "Legal" }
  ];

  const recommendations = [
    {
      type: "content",
      title: "Post More Video Content",
      description: "Video posts receive 3x more engagement than text posts in your network",
      impact: "High",
      effort: "Medium"
    },
    {
      type: "network",
      title: "Connect with Industry Leaders",
      description: "Expanding connections in the Technology sector could increase visibility by 40%",
      impact: "High",
      effort: "Low"
    },
    {
      type: "timing",
      title: "Optimal Posting Time",
      description: "Your audience is most active on Tuesdays and Thursdays at 10 AM",
      impact: "Medium",
      effort: "Low"
    },
    {
      type: "engagement",
      title: "Increase Comment Responses",
      description: "Responding to comments within 2 hours increases future engagement by 25%",
      impact: "Medium",
      effort: "Low"
    }
  ];

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent': return <Badge className="bg-green-100 text-green-600">Excellent</Badge>;
      case 'good': return <Badge className="bg-blue-100 text-blue-600">Good</Badge>;
      case 'average': return <Badge className="bg-yellow-100 text-yellow-600">Average</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <TrendingUp className="w-8 h-8 mr-3" />
                Professional Insights
              </h1>
              <p className="text-purple-100">Analyze your professional growth and optimize your networking strategy</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search insights, metrics, and trends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-full focus:bg-white/30"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-blue-600">{profileMetrics.profileViews.value.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="font-medium">+{profileMetrics.profileViews.change}%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Search Appearances</p>
                  <p className="text-2xl font-bold text-green-600">{profileMetrics.searchAppearances.value.toLocaleString()}</p>
                </div>
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="font-medium">+{profileMetrics.searchAppearances.change}%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Post Impressions</p>
                  <p className="text-2xl font-bold text-purple-600">{profileMetrics.postImpressions.value.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="font-medium">+{profileMetrics.postImpressions.change}%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{profileMetrics.engagementRate.value}%</p>
                </div>
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex items-center text-sm text-green-600 mt-2">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="font-medium">+{profileMetrics.engagementRate.change}%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Recommendations */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <Badge className={getImpactColor(rec.impact)}>
                            {rec.impact} Impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Effort: {rec.effort}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Network Insights */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Network className="w-5 h-5 mr-2 text-blue-600" />
                    Network Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {networkInsights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{insight.category}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-blue-600">{insight.count}</span>
                            <Badge className="bg-green-100 text-green-600">+{insight.growth}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {insight.topConnections.map((connection, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {connection}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Content Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentPerformance.map((content) => (
                    <div key={content.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{content.title}</h4>
                            <Badge variant="outline">{content.type}</Badge>
                            {getPerformanceBadge(content.performance)}
                          </div>
                          <p className="text-sm text-gray-500">{content.publishDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">{content.engagement}% engagement</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Eye className="w-4 h-4 text-gray-500 mr-1" />
                            <span className="text-sm font-medium">{content.views.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-500">Views</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Heart className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-sm font-medium">{content.likes}</span>
                          </div>
                          <p className="text-xs text-gray-500">Likes</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <MessageSquare className="w-4 h-4 text-blue-500 mr-1" />
                            <span className="text-sm font-medium">{content.comments}</span>
                          </div>
                          <p className="text-xs text-gray-500">Comments</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Share2 className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm font-medium">{content.shares}</span>
                          </div>
                          <p className="text-xs text-gray-500">Shares</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Connection Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-blue-600 mb-2">1,247</p>
                    <p className="text-gray-600">Total Connections</p>
                    <div className="flex items-center justify-center text-green-600 mt-2">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="font-medium">+15.3% this month</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Industry Leaders</span>
                      <span className="font-medium">124 (10%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Peers</span>
                      <span className="font-medium">567 (45%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Junior Professionals</span>
                      <span className="font-medium">556 (45%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                    Industry Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Technology</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Marketing</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Finance</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Healthcare</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Other</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                        </div>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                  Industry Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {industryTrends.map((trend, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{trend.topic}</h4>
                          <Badge variant="outline">{trend.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ArrowUp className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">+{trend.trend}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{trend.engagement.toLocaleString()} professionals engaged</p>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Analytics CTA */}
        <Card className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <h2 className="text-2xl font-bold mb-3">Advanced Analytics Available</h2>
              <p className="text-white/90 mb-6">
                Unlock deeper insights with our premium analytics suite and grow your professional presence faster
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Insights
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Goal Tracking
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Custom Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Insights;
