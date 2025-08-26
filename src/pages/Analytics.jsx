
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Target,
  Award,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Analytics = () => {
  const analytics = {
    profileViews: { current: 1247, change: 15.3, trend: 'up' },
    postReach: { current: 8934, change: 22.1, trend: 'up' },
    engagement: { current: 456, change: 8.7, trend: 'up' },
    networkGrowth: { current: 89, change: 12.4, trend: 'up' },
    connections: { current: 234, change: 5.8, trend: 'up' },
    posts: { current: 45, change: -2.1, trend: 'down' }
  };

  const monthlyData = [
    { month: 'Jan', views: 800, engagement: 120, connections: 15 },
    { month: 'Feb', views: 950, engagement: 150, connections: 22 },
    { month: 'Mar', views: 1100, engagement: 180, connections: 28 },
    { month: 'Apr', views: 1247, engagement: 220, connections: 34 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Professional Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Track your professional growth with AI-powered insights and analytics.
            </p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Profile Views</p>
                  <p className="text-3xl font-bold">{analytics.profileViews.current.toLocaleString()}</p>
                  <p className="text-blue-100 text-sm">
                    +{analytics.profileViews.change}% this month
                  </p>
                </div>
                <Eye className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Post Reach</p>
                  <p className="text-3xl font-bold">{analytics.postReach.current.toLocaleString()}</p>
                  <p className="text-green-100 text-sm">
                    +{analytics.postReach.change}% this month
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Engagement</p>
                  <p className="text-3xl font-bold">{analytics.engagement.current}</p>
                  <p className="text-purple-100 text-sm">
                    +{analytics.engagement.change}% this month
                  </p>
                </div>
                <Heart className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Network Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Connections</span>
                <span className="font-semibold">{analytics.connections.current}</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Growth Rate</span>
                <span className="text-green-600 font-medium">+{analytics.connections.change}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Content Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Posts Published</span>
                  <span className="font-semibold">{analytics.posts.current}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Engagement</span>
                  <span className="font-semibold">12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top Post Reach</span>
                  <span className="font-semibold">2,340</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {data.month}
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Views</span>
                        <span className="font-medium">{data.views}</span>
                      </div>
                      <Progress value={(data.views / 1500) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Engagement</span>
                        <span className="font-medium">{data.engagement}</span>
                      </div>
                      <Progress value={(data.engagement / 300) * 100} className="h-2 bg-green-100" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Connections</span>
                        <span className="font-medium">{data.connections}</span>
                      </div>
                      <Progress value={(data.connections / 50) * 100} className="h-2 bg-purple-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📈 Growth Opportunity</h4>
                <p className="text-sm text-gray-600">
                  Your engagement rate is 23% higher than industry average. Consider posting more frequently.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🎯 Optimization Tip</h4>
                <p className="text-sm text-gray-600">
                  Posts with images get 2.3x more engagement. Add visuals to boost your reach.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🚀 Network Expansion</h4>
                <p className="text-sm text-gray-600">
                  Connect with 5-10 professionals weekly to maximize your network growth potential.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">⏰ Best Time to Post</h4>
                <p className="text-sm text-gray-600">
                  Your audience is most active on Tuesday-Thursday between 9-11 AM.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
