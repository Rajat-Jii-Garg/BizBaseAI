
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  FileText,
  Calendar,
  Briefcase,
  Award,
  Users,
  MessageSquare,
  BarChart3,
  Zap,
  Rocket,
  Star,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

const ProfessionalTools = () => {
  const [selectedTool, setSelectedTool] = useState('career-advisor');

  const professionalTools = [
    {
      id: 'career-advisor',
      title: 'AI Career Advisor',
      description: 'Personalized career guidance and growth strategies',
      icon: Brain,
      color: 'from-blue-500 to-purple-600',
      features: ['Career Path Analysis', 'Skill Gap Assessment', 'Goal Setting', 'Industry Insights']
    },
    {
      id: 'skill-matcher',
      title: 'Smart Skill Matcher',
      description: 'Match your skills with trending opportunities',
      icon: Target,
      color: 'from-green-500 to-teal-600',
      features: ['Skill Assessment', 'Market Demand Analysis', 'Learning Recommendations', 'Certification Paths']
    },
    {
      id: 'salary-analyzer',
      title: 'Salary Intelligence',
      description: 'Real-time salary insights and negotiation tools',
      icon: DollarSign,
      color: 'from-orange-500 to-red-600',
      features: ['Salary Benchmarking', 'Negotiation Scripts', 'Market Trends', 'Compensation Planning']
    },
    {
      id: 'interview-coach',
      title: 'AI Interview Coach',
      description: 'Practice interviews with AI-powered feedback',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-600',
      features: ['Mock Interviews', 'Real-time Feedback', 'Question Bank', 'Performance Analytics']
    }
  ];

  const quickStats = [
    { label: 'Tools Used', value: '12', trend: '+3 this month' },
    { label: 'Career Score', value: '87/100', trend: '+5 points' },
    { label: 'Skills Improved', value: '8', trend: '2 new certifications' },
    { label: 'Goal Progress', value: '73%', trend: 'On track' }
  ];

  const recentActivities = [
    {
      tool: 'AI Career Advisor',
      action: 'Generated career roadmap for Senior Developer role',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      tool: 'Skill Matcher',
      action: 'Recommended React Native certification',
      time: '5 hours ago',
      status: 'in-progress'
    },
    {
      tool: 'Interview Coach',
      action: 'Completed mock interview session',
      time: '1 day ago',
      status: 'completed'
    },
    {
      tool: 'Salary Analyzer',
      action: 'Updated salary expectations for current market',
      time: '2 days ago',
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center">
            <Rocket className="w-12 h-12 mx-auto mb-4 text-white/90" />
            <h1 className="text-3xl font-bold mb-3">Professional Tools Suite</h1>
            <p className="text-white/90 text-lg mb-6">
              AI-powered tools to accelerate your professional growth
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80 mb-1">{stat.label}</div>
                  <div className="text-xs text-white/70">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {professionalTools.map((tool) => (
          <Card 
            key={tool.id} 
            className={`bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer ${
              selectedTool === tool.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedTool(tool.id)}
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">{tool.title}</CardTitle>
              <p className="text-gray-600">{tool.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {tool.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
              <Button className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90`}>
                <Zap className="w-4 h-4 mr-2" />
                Launch Tool
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool Details */}
      {selectedTool && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              {professionalTools.find(t => t.id === selectedTool)?.title} Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{activity.tool}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Track Progress
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Unlock */}
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Achievement Unlocked!</h3>
                <p className="text-gray-600">You've completed 5 professional assessments this month</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500">
              <Award className="w-4 h-4 mr-2" />
              View Badge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalTools;
