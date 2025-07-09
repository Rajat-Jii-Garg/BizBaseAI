
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Sparkles,
  Target,
  Zap,
  UserPlus,
  Star,
  ArrowRight
} from 'lucide-react';

interface AINetworkingAssistantProps {
  onSuggestConnection: (profileId: string) => void;
}

const AINetworkingAssistant: React.FC<AINetworkingAssistantProps> = ({ onSuggestConnection }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartSuggestions] = useState([
    {
      id: '1',
      name: 'Priya Sharma',
      position: 'AI Research Lead',
      company: 'TechCorp',
      matchScore: 95,
      reason: 'Shares similar AI/ML interests and has mutual connections',
      avatar: '',
      skills: ['Machine Learning', 'Data Science', 'Python']
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      position: 'Product Manager',
      company: 'StartupXYZ',
      matchScore: 87,
      reason: 'Works in complementary field with overlapping network',
      avatar: '',
      skills: ['Product Strategy', 'Analytics', 'Growth']
    },
    {
      id: '3',
      name: 'Sneha Patel',
      position: 'Design Director',
      company: 'CreativeStudio',
      matchScore: 82,
      reason: 'Similar career trajectory and industry involvement',
      avatar: '',
      skills: ['UX Design', 'Leadership', 'Innovation']
    }
  ]);

  const networkingTips = [
    "Share industry insights to increase visibility by 40%",
    "Engage with 5-7 posts daily for optimal network growth",
    "Comment thoughtfully to build meaningful connections",
    "Share original content twice per week for best engagement"
  ];

  const handleSmartIntro = (suggestion: any) => {
    // This would generate a personalized introduction message
    console.log(`Generating smart intro for ${suggestion.name}`);
  };

  return (
    <div className="space-y-4">
      {/* AI Networking Stats */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            AI Networking Insights
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-1">23%</div>
              <div className="text-xs text-gray-600">Network Growth</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
              <div className="text-xs text-gray-600">Quality Matches</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Smart Tips</h4>
            {networkingTips.slice(0, 2).map((tip, index) => (
              <div key={index} className="p-2 bg-white rounded text-xs text-gray-700">
                💡 {tip}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Connection Suggestions */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Smart Connections
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsAnalyzing(!isAnalyzing)}
            >
              <Zap className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {smartSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={suggestion.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                    {suggestion.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{suggestion.name}</h4>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-700 text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {suggestion.matchScore}% match
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {suggestion.position} at {suggestion.company}
                  </p>
                  
                  <p className="text-xs text-purple-600 mb-2">
                    🎯 {suggestion.reason}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {suggestion.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => onSuggestConnection(suggestion.id)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSmartIntro(suggestion)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Smart Intro
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="ghost" className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            View All AI Suggestions
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AINetworkingAssistant;
