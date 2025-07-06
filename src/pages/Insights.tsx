
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Eye, 
  Target, 
  DollarSign,
  Calendar,
  Award,
  Share2,
  Download,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  Globe,
  Brain,
  Zap,
  Star,
  Building2,
  LineChart,
  PieChart,
  Activity
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Insights = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const keyMetrics = [
    {
      title: "Profile Views",
      value: "3,847",
      change: "+23.5%",
      trend: "up",
      icon: Eye,
      color: "bg-blue-500",
      period: "Last 30 days"
    },
    {
      title: "Network Growth",
      value: "1,247",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "bg-green-500",
      period: "Total connections"
    },
    {
      title: "Engagement Rate",
      value: "8.9%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-purple-500",
      period: "Average interaction"
    },
    {
      title: "Business Opportunities",
      value: "89",
      change: "+31.5%",
      trend: "up",
      icon: Target,
      color: "bg-orange-500",
      period: "Active leads"
    }
  ];

  const industryBenchmarks = [
    {
      metric: "Professional Network Size",
      yourValue: 1247,
      industryAverage: 850,
      percentile: 85,
      status: "Above Average"
    },
    {
      metric: "Profile Completeness",
      yourValue: 95,
      industryAverage: 78,
      percentile: 92,
      status: "Excellent"
    },
    {
      metric: "Engagement Level",
      yourValue: 8.9,
      industryAverage: 6.2,
      percentile: 78,
      status: "Good"
    },
    {
      metric: "Content Performance",
      yourValue: 7.3,
      industryAverage: 5.8,
      percentile: 73,
      status: "Good"
    }
  ];

  const growthInsights = [
    {
      title: "Peak Activity Hours",
      description: "Your audience is most active between 9 AM - 11 AM and 2 PM - 4 PM on weekdays",
      recommendation: "Schedule your posts during these peak hours for maximum engagement",
      impact: "High",
      category: "Content Strategy"
    },
    {
      title: "Industry Trending Topics",
      description: "AI & Machine Learning, Sustainable Business, and Remote Work are trending in your industry",
      recommendation: "Create content around these topics to increase visibility",
      impact: "Medium",
      category: "Content Ideas"
    },
    {
      title: "Network Expansion Opportunity",
      description: "You have strong connections in Technology but limited reach in Finance sector",
      recommendation: "Connect with finance professionals to diversify your network",
      impact: "High",
      category: "Networking"
    },
    {
      title: "Skills Recognition",
      description: "Your Project Management skills are highly endorsed but Marketing skills need more visibility",
      recommendation: "Share case studies showcasing your marketing expertise",
      impact: "Medium",
      category: "Professional Branding"
    }
  ];

  const contentPerformance = [
    {
      type: "Article",
      title: "The Future of Remote Work in Tech Industry",
      views: 2340,
      likes: 187,
      comments: 23,
      shares: 45,
      engagement: 10.9,
      date: "5 days ago"
    },
    {
      type: "Post",
      title: "5 Key Lessons from Building a Startup",
      views: 1890,
      likes: 156,
      comments: 31,
      shares: 28,
      engagement: 11.4,
      date: "1 week ago"
    },
    {
      type: "Video",
      title: "Project Management Best Practices",
      views: 3120,
      likes: 298,
      comments: 42,
      shares: 67,
      engagement: 13.0,
      date: "2 weeks ago"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3" />
                Professional Insights & Analytics
              </h1>
              <p className="text-cyan-100">Data-driven insights to accelerate your professional growth</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((metric, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{metric.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.period}</p>
                  </div>
                  <div className={`${metric.color} p-3 rounded-xl`}>
                    <metric.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  <span className="font-medium">{metric.change}</span>
                  <span className="text-gray-500 ml-2">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Network Growth Chart */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                    Network Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600">Interactive chart showing your network growth over the past 6 months</p>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">+250</div>
                          <div className="text-gray-500">New Connections</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">18%</div>
                          <div className="text-gray-500">Growth Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-purple-600">92%</div>
                          <div className="text-gray-500">Acceptance Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Analytics */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-green-600" />
                    Profile Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-blue-900">Profile Views</p>
                        <p className="text-sm text-blue-600">Daily average: 127 views</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">3,847</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-green-900">Search Appearances</p>
                        <p className="text-sm text-green-600">Times appeared in search</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">892</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-purple-900">Profile Actions</p>
                        <p className="text-sm text-purple-600">Clicks on contact info</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">156</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Content */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-orange-600" />
                    Top Performing Content
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentPerformance.map((content, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline">{content.type}</Badge>
                            <span className="text-sm text-gray-500">{content.date}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">{content.title}</h4>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          {content.engagement}% engagement
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {content.views} views
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {content.likes} likes
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {content.comments} comments
                        </div>
                        <div className="flex items-center">
                          <Share2 className="w-4 h-4 mr-1" />
                          {content.shares} shares
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Content Engagement Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-600">Weekly engagement metrics and trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Audience Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                      <p className="text-gray-600">Geographic and industry distribution of your network</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Industry Benchmarks Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {industryBenchmarks.map((benchmark, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{benchmark.metric}</h4>
                        <Badge className={`${
                          benchmark.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                          benchmark.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {benchmark.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Performance</span>
                          <span className="font-semibold">{benchmark.yourValue}{benchmark.metric.includes('Size') ? '' : '%'}</span>
                        </div>
                        <Progress value={benchmark.percentile} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Industry Average: {benchmark.industryAverage}{benchmark.metric.includes('Size') ? '' : '%'}</span>
                          <span>{benchmark.percentile}th percentile</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  AI-Powered Growth Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {growthInsights.map((insight, index) => (
                    <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {insight.category}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-blue-900 text-sm">
                              <strong>Recommendation:</strong> {insight.recommendation}
                            </p>
                          </div>
                        </div>
                        <Badge className={`ml-4 ${
                          insight.impact === 'High' ? 'bg-red-100 text-red-700' :
                          insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {insight.impact} Impact
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Zap className="w-4 h-4 mr-2" />
                          Apply Suggestion
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Reminder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Insights CTA */}
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <h2 className="text-2xl font-bold mb-3">Unlock Advanced AI Insights</h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Get personalized recommendations, predictive analytics, and competitive intelligence to accelerate your professional growth.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Market Intelligence
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Predictive Analytics
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Personal AI Coach
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
