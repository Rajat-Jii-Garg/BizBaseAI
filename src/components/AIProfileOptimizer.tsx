
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Zap, 
  Award,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Bot
} from 'lucide-react';

interface AIProfileOptimizerProps {
  profile: any;
  onOptimize: (suggestions: any) => void;
}

const AIProfileOptimizer: React.FC<AIProfileOptimizerProps> = ({ profile, onOptimize }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileScore, setProfileScore] = useState(72);
  const [suggestions] = useState([
    {
      category: 'Profile Headline',
      priority: 'High',
      suggestion: 'Add action-oriented keywords that highlight your impact',
      improvement: '+15% visibility'
    },
    {
      category: 'Skills Match',
      priority: 'Medium',
      suggestion: 'Add trending skills in your industry',
      improvement: '+23% recruiter views'
    },
    {
      category: 'Content Strategy',
      priority: 'High',
      suggestion: 'Share more industry insights and thought leadership',
      improvement: '+40% engagement'
    }
  ]);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setProfileScore(85);
      onOptimize(suggestions);
    }, 2000);
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Profile Optimizer
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="mb-4">
            <div className="text-3xl font-bold text-purple-600 mb-2">{profileScore}/100</div>
            <p className="text-sm text-gray-600">Profile Optimization Score</p>
          </div>
          <Progress value={profileScore} className="h-3 mb-4" />
          <Button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {isAnalyzing ? (
              <>
                <Bot className="w-4 h-4 mr-2 animate-spin" />
                AI Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Get AI Insights
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Smart Recommendations
          </h4>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={suggestion.priority === 'High' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {suggestion.priority}
                  </Badge>
                  <span className="font-medium text-sm">{suggestion.category}</span>
                </div>
                <span className="text-xs text-green-600 font-medium">
                  {suggestion.improvement}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{suggestion.suggestion}</p>
              <Button size="sm" variant="ghost" className="text-purple-600 p-0 h-auto">
                Apply Suggestion <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Target className="w-4 h-4 mr-2" />
            Set Goals
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            Track Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIProfileOptimizer;
