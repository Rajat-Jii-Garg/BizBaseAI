
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Brain, 
  MessageSquare, 
  Star,
  TrendingUp,
  MapPin,
  Briefcase,
  Plus,
  Zap,
  Target,
  Network,
  UserPlus,
  Coffee,
  Video
} from 'lucide-react';

const SmartNetworking = () => {
  const [selectedTab, setSelectedTab] = useState('ai-recommendations');

  const aiRecommendations = [
    {
      name: "Priya Sharma",
      title: "Senior Product Manager",
      company: "Google",
      location: "Bangalore",
      mutualConnections: 15,
      matchScore: 95,
      reason: "Similar career trajectory and complementary skills",
      avatar: "/placeholder.svg"
    },
    {
      name: "Rahul Verma",
      title: "Tech Lead",
      company: "Microsoft",
      location: "Hyderabad",
      mutualConnections: 22,
      matchScore: 88,
      reason: "Works in your target technology stack",
      avatar: "/placeholder.svg"
    },
    {
      name: "Sneha Patel",
      title: "VP Engineering",
      company: "Flipkart",
      location: "Delhi",
      mutualConnections: 8,
      matchScore: 92,
      reason: "Potential mentor in leadership transition",
      avatar: "/placeholder.svg"
    }
  ];

  const networkingEvents = [
    {
      title: "AI & Future of Work",
      date: "Today, 6:00 PM",
      type: "Virtual Meetup",
      attendees: 156,
      relevanceScore: 98
    },
    {
      title: "Startup Founders Networking",
      date: "Tomorrow, 7:30 PM",
      type: "In-Person",
      attendees: 45,
      relevanceScore: 85
    },
    {
      title: "Women in Tech Leadership",
      date: "Dec 15, 5:00 PM",
      type: "Hybrid",
      attendees: 89,
      relevanceScore: 78
    }
  ];

  const quickActions = [
    { icon: Coffee, label: "Coffee Chat", action: "Schedule informal meeting" },
    { icon: Video, label: "Virtual Meet", action: "Quick video introduction" },
    { icon: MessageSquare, label: "Smart Intro", action: "AI-crafted introduction" },
    { icon: UserPlus, label: "Direct Connect", action: "Send connection request" }
  ];

  return (
    <div className="space-y-6">
      {/* AI Networking Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Brain className="w-7 h-7 mr-3" />
                AI-Powered Smart Networking
              </h2>
              <p className="text-white/90">
                Connect with the right professionals at the right time with AI insights
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">2.8K+</div>
              <div className="text-sm text-white/80">Connections Made</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={selectedTab === 'ai-recommendations' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setSelectedTab('ai-recommendations')}
        >
          <Brain className="w-4 h-4 mr-2" />
          AI Recommendations
        </Button>
        <Button
          variant={selectedTab === 'events' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setSelectedTab('events')}
        >
          <Network className="w-4 h-4 mr-2" />
          Smart Events
        </Button>
        <Button
          variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setSelectedTab('analytics')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Network Analytics
        </Button>
      </div>

      {/* AI Recommendations Tab */}
      {selectedTab === 'ai-recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Personalized Connection Recommendations</h3>
            <Button variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Refresh AI Analysis
            </Button>
          </div>
          
          {aiRecommendations.map((person, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={person.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-lg font-bold">
                        {person.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{person.name}</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <Star className="w-3 h-3 mr-1" />
                          {person.matchScore}% Match
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-1">{person.title}</p>
                      <p className="text-sm text-gray-500 mb-2">{person.company}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {person.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {person.mutualConnections} mutual connections
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-blue-800">
                          <Brain className="w-4 h-4 inline mr-1" />
                          AI Insight: {person.reason}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {quickActions.map((action, idx) => (
                          <Button key={idx} variant="outline" size="sm" className="flex-1">
                            <action.icon className="w-3 h-3 mr-1" />
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Smart Events Tab */}
      {selectedTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI-Curated Networking Events</h3>
            <Button variant="outline" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Set Preferences
            </Button>
          </div>
          
          {networkingEvents.map((event, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold">{event.title}</h4>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {event.relevanceScore}% Relevant
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.type}</span>
                      <span>•</span>
                      <span>{event.attendees} attendees</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                        <Plus className="w-3 h-3 mr-1" />
                        Join Event
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="w-3 h-3 mr-1" />
                        See Attendees
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Network Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Network Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">+127</div>
              <p className="text-sm text-gray-600 mb-4">New connections this month</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Connection Rate</span>
                  <span className="font-semibold text-green-600">+23%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Response Rate</span>
                  <span className="font-semibold text-blue-600">89%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quality Score</span>
                  <span className="font-semibold text-purple-600">8.4/10</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Industry Presence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Technology</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Finance</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consulting</span>
                    <span>20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Others</span>
                    <span>10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{width: '10%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartNetworking;
