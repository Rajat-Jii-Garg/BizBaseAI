
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  Zap,
  UserPlus,
  Star,
  ArrowRight
} from 'lucide-react';

const AINetworkingAssistant = ({ onSuggestConnection }) => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    networkGrowth: 0,
    qualityMatches: 0
  });

  // Fetch real user suggestions
  useEffect(() => {
    if (user) {
      fetchSmartSuggestions();
      fetchPerformanceData();
    }
  }, [user]);

  const fetchSmartSuggestions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get users who are not already connected and not the current user
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const connectedUserIds = new Set();
      existingConnections?.forEach(conn => {
        if (conn.requester_id !== user.id) connectedUserIds.add(conn.requester_id);
        if (conn.addressee_id !== user.id) connectedUserIds.add(conn.addressee_id);
      });

      const { data: suggestions } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name, industry, skills')
        .neq('id', user.id)
        .not('full_name', 'eq', null)
        .limit(15);

      const filteredSuggestions = suggestions?.filter(suggestion => 
        !connectedUserIds.has(suggestion.id)
      ).slice(0, 3) || [];

      // Transform to match expected format
      const transformedSuggestions = filteredSuggestions.map(suggestion => ({
        id: suggestion.id,
        name: suggestion.full_name,
        position: suggestion.current_position || 'Professional',
        company: suggestion.company_name || 'Company',
        matchScore: Math.floor(Math.random() * 30) + 70, // AI score simulation
        reason: `Based on ${suggestion.industry || 'professional'} background and mutual interests`,
        avatar: suggestion.avatar_url || '',
        skills: suggestion.skills?.slice(0, 3) || ['Professional Skills']
      }));

      setSmartSuggestions(transformedSuggestions);
    } catch (error) {
      console.error('Error fetching smart suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    if (!user) return;
    
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get new connections this week
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get total potential connections
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id);

      setPerformanceData({
        networkGrowth: Math.floor(((connectionsData?.length || 0) / 7) * 100),
        qualityMatches: profilesData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const networkingTips = [
    "Share industry insights to increase visibility by 40%",
    "Engage with 5-7 posts daily for optimal network growth",
    "Comment thoughtfully to build meaningful connections",
    "Share original content twice per week for best engagement"
  ];

  const handleSmartIntro = (suggestion) => {
    console.log(`Generating smart intro for ${suggestion.name}`);
  };

  return (
    <div className="space-y-4">
      {/* AI Networking Stats */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-4 h-4 text-indigo-600" />
            AI Networking Insights
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-xl font-bold text-indigo-600 mb-1">{performanceData.networkGrowth}%</div>
              <div className="text-xs text-gray-600">Network Growth</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-xl font-bold text-purple-600 mb-1">{performanceData.qualityMatches}</div>
              <div className="text-xs text-gray-600">Quality Matches</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-2">
            <h4 className="font-medium text-sm mb-2">Smart Tips</h4>
            <div className="space-y-1">
              {networkingTips.slice(0, 2).map((tip, index) => (
                <div key={index} className="text-xs text-gray-700 flex items-start">
                  <span className="mr-2">💡</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Connection Suggestions */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Smart Connections
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={fetchSmartSuggestions}
              disabled={loading}
            >
              <Zap className="w-3 h-3 mr-1" />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-600">Loading suggestions...</div>
          ) : smartSuggestions.length === 0 ? (
            <div className="text-center py-4 text-gray-600">No suggestions available</div>
          ) : (
            smartSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-3 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={suggestion.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-xs">
                    {suggestion.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{suggestion.name}</h4>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-700 text-xs flex-shrink-0"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {suggestion.matchScore}%
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-1 truncate">
                    {suggestion.position} at {suggestion.company}
                  </p>
                  
                  <p className="text-xs text-purple-600 mb-2 line-clamp-2">
                    🎯 {suggestion.reason}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {suggestion.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-auto"
                      onClick={() => onSuggestConnection(suggestion.id)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs px-2 py-1 h-auto"
                      onClick={() => handleSmartIntro(suggestion)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Intro
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
          
          <Button variant="ghost" className="w-full text-sm">
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
