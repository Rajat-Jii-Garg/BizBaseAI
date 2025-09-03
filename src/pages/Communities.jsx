import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Plus, 
  Star,
  MapPin,
  Calendar,
  MessageSquare,
  TrendingUp,
  User,
  Crown,
  Globe,
  Lock,
  Hash,
  Briefcase,
  BookOpen,
  Zap,
  Target,
  Coffee,
  Code,
  PaintBrush,
  Music
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Communities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  // Mock data for communities - in real app this would come from database
  const mockCommunities = [
    {
      id: 1,
      name: "Tech Entrepreneurs",
      description: "Network of technology entrepreneurs and startup founders",
      members: 15420,
      category: "Technology",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
      isPrivate: false,
      tags: ["startup", "technology", "entrepreneurship"],
      activity: "Very Active",
      icon: Code
    },
    {
      id: 2,
      name: "Digital Marketing Pros",
      description: "Marketing professionals sharing strategies and insights",
      members: 8934,
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      isPrivate: false,
      tags: ["marketing", "digital", "growth"],
      activity: "Active",
      icon: TrendingUp
    },
    {
      id: 3,
      name: "UX/UI Designers Hub",
      description: "Creative space for designers to share work and get feedback",
      members: 12156,
      category: "Design",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
      isPrivate: false,
      tags: ["design", "ui", "ux", "creative"],
      activity: "Very Active",
      icon: PaintBrush
    },
    {
      id: 4,
      name: "Remote Work Masters",
      description: "Tips and best practices for remote and hybrid work",
      members: 6721,
      category: "Professional",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
      isPrivate: false,
      tags: ["remote", "productivity", "work-life"],
      activity: "Active",
      icon: Coffee
    },
    {
      id: 5,
      name: "AI & Machine Learning",
      description: "Discussing AI trends, research, and practical applications",
      members: 18932,
      category: "Technology",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
      isPrivate: false,
      tags: ["ai", "ml", "data science"],
      activity: "Very Active",
      icon: Zap
    },
    {
      id: 6,
      name: "Business Leadership",
      description: "Executive leadership strategies and management insights",
      members: 4521,
      category: "Leadership",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
      isPrivate: true,
      tags: ["leadership", "management", "strategy"],
      activity: "Moderate",
      icon: Crown
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setCommunities(mockCommunities);
      setJoinedCommunities([1, 3]); // User has joined communities 1 and 3
      setLoading(false);
    }, 1000);
  }, []);

  const handleJoinCommunity = (communityId) => {
    setJoinedCommunities(prev => [...prev, communityId]);
    toast({
      title: "Joined Community!",
      description: "You're now a member of this community."
    });
  };

  const handleLeaveCommunity = (communityId) => {
    setJoinedCommunities(prev => prev.filter(id => id !== communityId));
    toast({
      title: "Left Community",
      description: "You've left this community."
    });
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const myCommunitiesData = communities.filter(community => 
    joinedCommunities.includes(community.id)
  );

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'Very Active': return 'text-green-600 bg-green-100';
      case 'Active': return 'text-blue-600 bg-blue-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const CommunityCard = ({ community, isJoined = false }) => (
    <Card key={community.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden">
      <div className="relative">
        <div 
          className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"
          style={{
            backgroundImage: `url(${community.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {community.isPrivate ? (
              <Badge className="bg-red-500 text-white">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            ) : (
              <Badge className="bg-green-500 text-white">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
              <community.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{community.name}</h3>
            <Badge variant="outline" className="text-xs">
              {community.category}
            </Badge>
          </div>
          <Badge className={`text-xs ${getActivityColor(community.activity)}`}>
            {community.activity}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {community.description}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {community.members.toLocaleString()} members
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            Active
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {community.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Hash className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          {isJoined ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLeaveCommunity(community.id)}
                className="flex-1"
              >
                Leave
              </Button>
              <Button size="sm" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Open
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleJoinCommunity(community.id)}
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  Communities
                </h1>
                <p className="text-gray-600">Connect with like-minded professionals and grow your network</p>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6 shadow-lg border-0">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search communities, topics, or interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg border-0 p-1 rounded-xl">
              <TabsTrigger 
                value="discover" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium rounded-lg"
              >
                Discover
              </TabsTrigger>
              <TabsTrigger 
                value="my-communities"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium rounded-lg"
              >
                My Communities
              </TabsTrigger>
              <TabsTrigger 
                value="trending"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium rounded-lg"
              >
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <div className="h-32 bg-gray-300"></div>
                      <CardContent className="p-6 space-y-4">
                        <div className="h-6 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredCommunities.map((community) => (
                    <CommunityCard 
                      key={community.id} 
                      community={community} 
                      isJoined={joinedCommunities.includes(community.id)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-communities">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCommunitiesData.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="text-center py-12">
                      <CardContent>
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Communities Yet</h3>
                        <p className="text-gray-600 mb-6">Join your first community to start connecting with professionals</p>
                        <Button onClick={() => setActiveTab('discover')}>
                          Explore Communities
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  myCommunitiesData.map((community) => (
                    <CommunityCard 
                      key={community.id} 
                      community={community} 
                      isJoined={true}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="trending">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities
                  .filter(c => c.activity === 'Very Active')
                  .map((community) => (
                    <CommunityCard 
                      key={community.id} 
                      community={community} 
                      isJoined={joinedCommunities.includes(community.id)}
                    />
                  ))
                }
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Communities;