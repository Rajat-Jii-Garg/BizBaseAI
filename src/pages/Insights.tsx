import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Eye, 
  Users, 
  MessageSquare,
  Share2,
  Calendar,
  Target,
  Award,
  Zap,
  Brain,
  Lightbulb,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Clock,
  Filter
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const Insights = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock analytics data - replace with real data from Supabase
  const analyticsData = {
    profileViews: {
      current: 1247,
      previous: 987,
      change: 26.3,
      trend: 'up'
    },
    connections: {
      current: 89,
      previous: 76,
      change: 17.1,
      trend: 'up'
    },
    postEngagement: {
      current: 456,
      previous: 523,
      change: -12.8,
      trend: 'down'
    },
    searchAppearances: {
      current: 2341,
      previous: 2156,
      change: 8.6,
      trend: 'up'
    }
  };

  const performanceMetrics = [
    {
      title: "Profile Completeness",
      value: 92,
      maxValue: 100,
      description: "Your profile is 92% complete",
      suggestions: ["Add portfolio projects", "Update skills section"],
      color: "blue"
    },
    {
      title: "Network Growth",
      value: 78,
      maxValue: 100,
      description: "Growing faster than 78% of professionals",
      suggestions: ["Connect with 5 more people", "Engage with posts"],
      color: "green"
    },
    {
      title: "Content Performance",
      value: 65,
      maxValue: 100,
      description: "Your posts perform well",
      suggestions: ["Post more consistently", "Use trending hashtags"],
      color: "purple"
    },
    {
      title: "Professional Branding",
      value: 85,
      maxValue: 100,
      description: "Strong professional presence",
      suggestions: ["Share industry insights", "Write articles"],
      color: "orange"
    }
  ];

  const getChangeIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  const getChangeColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Professional Insights
            </h1>
            <p className="text-gray-600 mt-2">Track your professional growth and discover opportunities</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Profile Views</p>
                  <p className="text-2xl font-bold text-blue-900">{analyticsData.profileViews.current.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                {getChangeIcon(analyticsData.profileViews.trend)}
                <span className={`text-sm font-medium ${getChangeColor(analyticsData.profileViews.trend)}`}>
                  {analyticsData.profileViews.change}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">New Connections</p>
                  <p className="text-2xl font-bold text-green-900">{analyticsData.connections.current}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                {getChangeIcon(analyticsData.connections.trend)}
                <span className={`text-sm font-medium ${getChangeColor(analyticsData.connections.trend)}`}>
                  {analyticsData.connections.change}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Post Engagement</p>
                  <p className="text-2xl font-bold text-purple-900">{analyticsData.postEngagement.current}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                {getChangeIcon(analyticsData.postEngagement.trend)}
                <span className={`text-sm font-medium ${getChangeColor(analyticsData.postEngagement.trend)}`}>
                  {Math.abs(analyticsData.postEngagement.change)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Search Appearances</p>
                  <p className="text-2xl font-bold text-orange-900">{analyticsData.searchAppearances.current.toLocaleString()}</p>
                </div>
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-2">
                {getChangeIcon(analyticsData.searchAppearances.trend)}
                <span className={`text-sm font-medium ${getChangeColor(analyticsData.searchAppearances.trend)}`}>
                  {analyticsData.searchAppearances.change}% from last period
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{metric.title}</h4>
                    <span className="text-2xl font-bold text-gray-900">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-3" />
                  <p className="text-sm text-gray-600">{metric.description}</p>
                  <div className="flex gap-2">
                    {metric.suggestions.map((suggestion, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Insights;