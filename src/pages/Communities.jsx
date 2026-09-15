import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Palette,
  RefreshCw,
  Clock,
  UserPlus,
  ArrowUpRight
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
  const [membershipMap, setMembershipMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommunities = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('members_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error(
        error?.message ||
          'Failed to fetch communities'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchMemberships = useCallback(async () => {
    if (!user) {
      setMembershipMap(new Map());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(
          'community_id, role, status'
        )
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      const map = new Map();

      (data || []).forEach(
        (membership) => {
          map.set(
            membership.community_id,
            membership
          );
        }
      );

      setMembershipMap(map);
    } catch (error) {
      console.error(
        'Error fetching memberships:',
        error
      );
    }
  }, [user]);

  const refreshAll = useCallback(
    async () => {
      await Promise.all([
        fetchCommunities(true),
        fetchMemberships(),
      ]);
    },
    [
      fetchCommunities,
      fetchMemberships,
    ]
  );

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const handleJoinCommunity = async (
    e,
    community
  ) => {
    e.stopPropagation();

    if (!user) {
      toast.error(
        'Please login to join a community'
      );
      return;
    }

    const existing =
      membershipMap.get(
        community.id
      );

    if (
      existing?.status ===
      'approved'
    ) {
      navigate(
        `/communities/${community.id}`
      );
      return;
    }

    if (
      existing?.status ===
      'pending'
    ) {
      toast.info(
        'Your join request is already pending'
      );
      return;
    }

    try {
      const status =
        community.is_private
          ? 'pending'
          : 'approved';

      const { error } =
        await supabase
          .from(
            'community_members'
          )
          .insert({
            community_id:
              community.id,
            user_id:
              user.id,
            role: 'member',
            status,
          });

      if (error) {
        throw error;
      }

      setMembershipMap(
        (previous) => {
          const next =
            new Map(previous);

          next.set(
            community.id,
            {
              community_id:
                community.id,
              role: 'member',
              status,
            }
          );

          return next;
        }
      );

      if (
        status ===
        'pending'
      ) {
        toast.success(
          'Join request sent',
          {
            description:
              'The community admin will review your request.',
          }
        );
      } else {
        setCommunities(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                community.id
                  ? {
                      ...item,
                      members_count:
                        (item.members_count ||
                          0) + 1,
                    }
                  : item
            )
        );

        toast.success(
          'Joined Community!'
        );
      }
    } catch (error) {
      console.error(
        'Error joining community:',
        error
      );

      toast.error(
        error?.message ||
          'Failed to join community'
      );
    }
  };

  const handleLeaveCommunity =
    async (
      e,
      community
    ) => {
      e.stopPropagation();

      if (!user) {
        return;
      }

      const membership =
        membershipMap.get(
          community.id
        );

      if (!membership) {
        return;
      }

      try {
        const { error } =
          await supabase
            .from(
              'community_members'
            )
            .delete()
            .eq(
              'community_id',
              community.id
            )
            .eq(
              'user_id',
              user.id
            );

        if (error) {
          throw error;
        }

        setMembershipMap(
          (previous) => {
            const next =
              new Map(previous);

            next.delete(
              community.id
            );

            return next;
          }
        );

        if (
          membership.status ===
          'approved'
        ) {
          setCommunities(
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  community.id
                    ? {
                        ...item,
                        members_count:
                          Math.max(
                            (item.members_count ||
                              1) - 1,
                            0
                          ),
                      }
                    : item
              )
          );
        }

        toast.success(
          'Left Community'
        );
      } catch (error) {
        console.error(
          'Error leaving community:',
          error
        );

        toast.error(
          error?.message ||
            'Failed to leave community'
        );
      }
    };

  const filteredCommunities =
    useMemo(() => {
      const query =
        searchTerm
          .toLowerCase()
          .trim();

      if (!query) {
        return communities;
      }

      return communities.filter(
        (community) =>
          community.name
            ?.toLowerCase()
            .includes(query) ||
          community.description
            ?.toLowerCase()
            .includes(query) ||
          community.category
            ?.toLowerCase()
            .includes(query) ||
          (
            Array.isArray(
              community.tags
            ) &&
            community.tags.some(
              (tag) =>
                String(tag)
                  .toLowerCase()
                  .includes(
                    query
                  )
            )
          )
      );
    }, [
      communities,
      searchTerm,
    ]);

  const myCommunitiesData =
    useMemo(
      () =>
        filteredCommunities.filter(
          (community) =>
            membershipMap.get(
              community.id
            )?.status ===
            'approved'
        ),
      [
        filteredCommunities,
        membershipMap,
      ]
    );

  const displayData =
    activeTab ===
    'discover'
      ? filteredCommunities
      : myCommunitiesData;

  const getActivityColor =
    (activity) => {
      switch (activity) {
        case 'very_active':
          return 'text-green-600 bg-green-100';

        case 'active':
          return 'text-blue-600 bg-blue-100';

        case 'moderate':
          return 'text-yellow-700 bg-yellow-100';

        default:
          return 'text-gray-600 bg-gray-100';
      }
    };

  const getActivityLabel =
    (activity) => {
      switch (activity) {
        case 'very_active':
          return 'Very Active';

        case 'active':
          return 'Active';

        case 'moderate':
          return 'Moderate';

        default:
          return 'Quiet';
      }
    };

  const getCategoryIcon =
    (category) => {
      switch (
        (
          category || ''
        ).toLowerCase()
      ) {
        case 'technology':
          return Code;

        case 'marketing':
          return TrendingUp;

        case 'design':
          return Palette;

        case 'business':
          return Briefcase;

        case 'education':
          return BookOpen;

        case 'leadership':
          return Crown;

        default:
          return Users;
      }
    };

  const CommunityCard =
    ({
      community,
    }) => {
      const CategoryIcon =
        getCategoryIcon(
          community.category
        );

      const membership =
        membershipMap.get(
          community.id
        );

      const isJoined =
        membership?.status ===
        'approved';

      const isPending =
        membership?.status ===
        'pending';

      return (
        <Card
          className="group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/80 bg-white overflow-hidden cursor-pointer flex flex-col h-full"
          onClick={() =>
            navigate(
              `/communities/${community.id}`
            )
          }
        >
          <div className="relative">
            <div
              className="h-28 sm:h-32 bg-gradient-to-r from-blue-600 to-purple-700"
              style={{
                backgroundImage:
                  community.image_url
                    ? `url(${community.image_url})`
                    : undefined,
                backgroundSize:
                  'cover',
                backgroundPosition:
                  'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/10" />

              <div className="absolute top-3 left-3">
                <Badge
                  className={`${
                    community.is_private
                      ? 'bg-red-500'
                      : 'bg-emerald-500'
                  } text-white border-0 shadow-sm text-[10px] sm:text-xs`}
                >
                  {community.is_private ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </>
                  )}
                </Badge>
              </div>

              <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>

          <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground truncate group-hover:text-blue-600 transition-colors">
                  {community.name}
                </h3>

                {community.category && (
                  <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs mt-1"
                  >
                    {community.category}
                  </Badge>
                )}
              </div>

              <Badge
                className={`text-[10px] sm:text-xs ml-2 shrink-0 border-0 ${getActivityColor(
                  community.activity_level
                )}`}
              >
                {getActivityLabel(
                  community.activity_level
                )}
              </Badge>
            </div>

            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2 min-h-[40px]">
              {community.description ||
                'Connect, share knowledge and grow with this professional community.'}
            </p>

            <div className="flex items-center gap-4 mb-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {(community.members_count ||
                  0).toLocaleString()}{' '}
                members
              </div>

              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Community
              </div>
            </div>

            {Array.isArray(
              community.tags
            ) &&
              community.tags.length >
                0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {community.tags
                    .slice(0, 3)
                    .map(
                      (
                        tag,
                        index
                      ) => (
                        <Badge
                          key={`${tag}-${index}`}
                          variant="secondary"
                          className="text-[10px] sm:text-xs bg-slate-100"
                        >
                          <Hash className="w-2.5 h-2.5 mr-0.5" />
                          {tag}
                        </Badge>
                      )
                    )}
                </div>
              )}

            <div
              className="flex gap-2 mt-auto"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {isJoined ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) =>
                      handleLeaveCommunity(
                        e,
                        community
                      )
                    }
                    className="flex-1 h-9 text-xs sm:text-sm"
                  >
                    Leave
                  </Button>

                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/communities/${community.id}`
                      )
                    }
                    className="flex-1 h-9 text-xs sm:text-sm bg-teal-600 hover:bg-teal-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                    Open
                  </Button>
                </>
              ) : isPending ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-xs sm:text-sm text-amber-700 border-amber-200 bg-amber-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/communities/${community.id}`
                    );
                  }}
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Request Pending
                </Button>
              ) : (
                <Button
                  onClick={(e) =>
                    handleJoinCommunity(
                      e,
                      community
                    )
                  }
                  size="sm"
                  className="w-full h-9 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {community.is_private ? (
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 mr-1" />
                  )}

                  {community.is_private
                    ? 'Request to Join'
                    : 'Join Community'}
                </Button>
              )}
            </div>

            <button
              type="button"
              className="mt-2 text-[11px] text-muted-foreground hover:text-blue-600 flex items-center justify-center gap-1 w-full"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/communities/${community.id}`
                );
              }}
            >
              View community
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </CardContent>
        </Card>
      );
    };

  return (
    <DashboardLayout>
      <SEOHead
        title="Communities - Connect with Professionals"
        description="Join professional communities on BizBase AI. Share knowledge, network, collaborate and grow with like-minded professionals."
        path="/communities"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                Communities
              </h1>

              <p className="text-xs sm:text-base text-muted-foreground mt-1">
                Connect, collaborate and grow with professionals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={refreshAll}
                disabled={refreshing}
                title="Refresh communities"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }`}
                />
              </Button>

              <CreateCommunityModal
                onCommunityCreated={() => {
                  fetchCommunities(
                    true
                  );
                  fetchMemberships();
                }}
              />
            </div>
          </div>

          <div className="relative mb-4 sm:mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              type="text"
              placeholder="Search communities, topics or categories..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="pl-9 pr-4 h-10 sm:h-11 text-sm border border-border rounded-xl bg-white focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="flex gap-1 mb-5 sm:mb-6 bg-white rounded-xl p-1 shadow-sm border border-border">
            <button
              onClick={() =>
                setActiveTab(
                  'discover'
                )
              }
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab ===
                'discover'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Communities
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  'my-communities'
                )
              }
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab ===
                'my-communities'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              My Communities
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({
                length: 6,
              }).map(
                (
                  _,
                  index
                ) => (
                  <Card
                    key={index}
                    className="animate-pulse border-0 overflow-hidden"
                  >
                    <div className="h-28 sm:h-32 bg-slate-200" />

                    <CardContent className="p-4 space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          ) : displayData.length ===
            0 ? (
            <Card className="text-center py-14 border-0 shadow-sm">
              <CardContent>
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground/50" />

                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  {activeTab ===
                  'my-communities'
                    ? 'No Communities Yet'
                    : 'No Communities Found'}
                </h3>

                <p className="text-muted-foreground text-sm mb-4">
                  {activeTab ===
                  'my-communities'
                    ? 'Join a community to start networking and participating.'
                    : 'Try a different search term or create a new community.'}
                </p>

                {activeTab ===
                  'my-communities' && (
                  <Button
                    onClick={() =>
                      setActiveTab(
                        'discover'
                      )
                    }
                    size="sm"
                  >
                    Explore Communities
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayData.map(
                (community) => (
                  <CommunityCard
                    key={
                      community.id
                    }
                    community={
                      community
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Communities;