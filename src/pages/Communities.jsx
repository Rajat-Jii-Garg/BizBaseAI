import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  TrendingUp,
  Globe,
  Lock,
  Hash,
  Briefcase,
  BookOpen,
  Crown,
  Code,
  Palette
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CreateCommunityModal from '@/components/CreateCommunityModal';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';

const Communities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    fetchCommunities();
    if (user) {
      fetchJoinedCommunities();
    }
  }, [user]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('members_count', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error(error?.message || "Failed to fetch communities");
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedCommunities = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setJoinedCommunities(data?.map(item => item.community_id) || []);
    } catch (error) {
      console.error('Error fetching joined communities:', error);
    }
  };

  const handleJoinCommunity = async (e, communityId) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to join community");
      return;
    }
    try {
      const { error } = await supabase
        .from('community_members')
        .insert({ community_id: communityId, user_id: user.id, role: 'member' });

      if (error) throw error;
      setJoinedCommunities(prev => [...prev, communityId]);
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, members_count: (c.members_count || 0) + 1 } : c));
      toast.success("Joined Community!");
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error(error?.message || "Failed to join community");
    }
  };

  const handleLeaveCommunity = async (e, communityId) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;
      setJoinedCommunities(prev => prev.filter(id => id !== communityId));
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, members_count: Math.max((c.members_count || 1) - 1, 0) } : c));
      toast.success("Left Community");
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error(error?.message || "Failed to leave community");
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const myCommunitiesData = communities.filter(community => joinedCommunities.includes(community.id));
  const displayData = activeTab === 'discover' ? filteredCommunities : myCommunitiesData;

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'very_active': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityLabel = (activity) => {
    switch (activity) {
      case 'very_active': return 'Very Active';
      case 'active': return 'Active';
      case 'moderate': return 'Moderate';
      default: return 'Quiet';
    }
  };

  const getCategoryIcon = (category) => {
    if (!category) return Users;
    switch (category.toLowerCase()) {
      case 'technology': return Code;
      case 'marketing': return TrendingUp;
      case 'design': return Palette;
      case 'business': return Briefcase;
      case 'education': return BookOpen;
      case 'leadership': return Crown;
      default: return Users;
    }
  };

  const CommunityCard = ({ community, isJoined = false }) => {
    const CategoryIcon = getCategoryIcon(community.category || '');

    return (
      <Card
        className="hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden cursor-pointer"
        onClick={() => navigate(`/communities/${community.id}`)}
      >
        <div className="relative">
          <div
            className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-purple-600"
            style={{
              backgroundImage: community.image_url ? `url(${community.image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
              {community.is_private ? (
                <Badge className="bg-red-500 text-white text-[10px] sm:text-xs">
                  <Lock className="w-3 h-3 mr-1" />Private
                </Badge>
              ) : (
                <Badge className="bg-green-500 text-white text-[10px] sm:text-xs">
                  <Globe className="w-3 h-3 mr-1" />Public
                </Badge>
              )}
            </div>
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
              <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-full">
                <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-bold text-foreground truncate">{community.name}</h3>
              <Badge variant="outline" className="text-[10px] sm:text-xs mt-1">{community.category}</Badge>
            </div>
            <Badge className={`text-[10px] sm:text-xs ml-2 shrink-0 ${getActivityColor(community.activity_level)}`}>
              {getActivityLabel(community.activity_level)}
            </Badge>
          </div>

          <p className="text-muted-foreground text-xs sm:text-sm mb-3 line-clamp-2">{community.description}</p>

          <div className="flex items-center gap-3 mb-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {community.members_count?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {getActivityLabel(community.activity_level)}
            </div>
          </div>

          {community.tags && community.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {community.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-[10px] sm:text-xs">
                  <Hash className="w-2.5 h-2.5 mr-0.5" />{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {isJoined ? (
              <>
                <Button variant="outline" size="sm" onClick={(e) => handleLeaveCommunity(e, community.id)} className="flex-1 h-8 text-xs sm:text-sm">Leave</Button>
                <Button size="sm" className="flex-1 h-8 text-xs sm:text-sm" onClick={(e) => { e.stopPropagation(); navigate(`/communities/${community.id}`); }}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />Open
                </Button>
              </>
            ) : (
              <Button onClick={(e) => handleJoinCommunity(e, community.id)} size="sm" className="w-full h-8 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-3.5 h-3.5 mr-1" />Join Community
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <SEOHead title="Communities - Connect with Professionals" description="Join professional communities on BizBase AI. Share knowledge, network, and collaborate with like-minded professionals." path="/communities" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          {/* Header: Title + Create button */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                Communities
              </h1>
              <p className="text-xs sm:text-base text-muted-foreground mt-0.5 hidden sm:block">Connect with like-minded professionals</p>
            </div>
            <CreateCommunityModal onCommunityCreated={() => { fetchCommunities(); fetchJoinedCommunities(); }} />
          </div>

          {/* Search bar */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 h-10 text-sm border border-border rounded-[10px] bg-white focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Tab buttons */}
          <div className="flex gap-2 mb-4 sm:mb-6 bg-white rounded-xl p-1 shadow-sm border border-border">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Communities
            </button>
            <button
              onClick={() => setActiveTab('my-communities')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'my-communities'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              My Communities
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse border-0">
                  <div className="h-24 sm:h-32 bg-gray-200 rounded-t-lg" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayData.length === 0 ? (
            <Card className="text-center py-12 border-0">
              <CardContent>
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  {activeTab === 'my-communities' ? 'No Communities Yet' : 'No Communities Found'}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {activeTab === 'my-communities' 
                    ? 'Join your first community to start connecting' 
                    : 'Try a different search term'}
                </p>
                {activeTab === 'my-communities' && (
                  <Button onClick={() => setActiveTab('discover')} size="sm">
                    Explore Communities
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {displayData.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isJoined={joinedCommunities.includes(community.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Communities;
