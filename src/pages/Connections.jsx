import React, { useEffect, useState } from 'react';
import {
  useNavigate,
  useSearchParams
} from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import {
  Users,
  Search,
  MessageSquare,
  UserPlus,
  Loader2,
  RefreshCw,
  Check,
  X,
  UserCheck,
  Sparkles,
  Clock,
  Send
} from 'lucide-react';

import SEOHead from '@/components/SEOHead';
import DashboardLayout from '@/components/DashboardLayout';
import { useConnections } from '@/hooks/useConnections';
import { supabase } from '@/integrations/supabase/client';

const Connections = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useAuth();

  const [searchTerm, setSearchTerm] =
    useState('');

  const [messageLoadingId, setMessageLoadingId] =
    useState(null);

  const tabFromUrl =
    searchParams.get('tab');

  const [activeTab, setActiveTab] =
    useState(
      tabFromUrl === 'received'
        ? 'requests'
        : 'connections'
    );

  const [requestsSubTab, setRequestsSubTab] =
    useState(
      tabFromUrl === 'sent'
        ? 'sent'
        : 'received'
    );

  useEffect(() => {
    if (tabFromUrl === 'received') {
      setActiveTab('requests');
      setRequestsSubTab('received');
    }

    if (tabFromUrl === 'sent') {
      setActiveTab('requests');
      setRequestsSubTab('sent');
    }
  }, [tabFromUrl]);

  const {
    connections,
    receivedRequests,
    sentRequests,
    suggestions,
    suggestionsLoading,
    loading: connectionsLoading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    withdrawRequest,
    refreshSuggestions,
    removeSuggestion,
  } = useConnections();

  const getProfilePath = (profile) => {
    if (profile?.username) {
      return `/@${encodeURIComponent(
        profile.username
      )}`;
    }

    return null;
  };

  const openProfile = (profile) => {
    const path = getProfilePath(profile);

    if (path) {
      navigate(path);
      return;
    }

    toast.error(
      'This user has not set a public username yet.'
    );
  };

  const getProfileAbout = (profile) => {
    return (
      profile?.about?.trim() ||
      profile?.bio?.trim() ||
      profile?.username ||
      'BizBase member'
    );
  };

  const getInitials = (
    name,
    username
  ) => {
    const value =
      name?.trim() ||
      username?.trim() ||
      'U';

    return value
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConnections =
    connections.filter((conn) => {
      const profile =
        conn.requester_profile?.id ===
        user?.id
          ? conn.addressee_profile
          : conn.requester_profile;

      const query =
        searchTerm
          .toLowerCase()
          .trim();

      if (!query) return true;

      return (
        profile?.full_name
          ?.toLowerCase()
          .includes(query) ||
        profile?.username
          ?.toLowerCase()
          .includes(query) ||
        profile?.about
          ?.toLowerCase()
          .includes(query) ||
        profile?.bio
          ?.toLowerCase()
          .includes(query) ||
        profile?.current_position
          ?.toLowerCase()
          .includes(query) ||
        profile?.location
          ?.toLowerCase()
          .includes(query)
      );
    });

  const handleMessage = async (
    profile
  ) => {
    if (
      !user?.id ||
      !profile?.id ||
      messageLoadingId
    ) {
      return;
    }

    setMessageLoadingId(
      profile.id
    );

    try {
      const {
        data: conversation,
        error
      } = await supabase.rpc(
        'get_or_create_direct_conversation',
        {
          p_other_user_id:
            profile.id,
        }
      );

      if (error) {
        throw error;
      }

      if (!conversation?.id) {
        throw new Error(
          'Conversation could not be created.'
        );
      }

      navigate(
        `/messages?conversation=${encodeURIComponent(
          conversation.id
        )}`
      );
    } catch (error) {
      console.error(
        'Error opening conversation:',
        error
      );

      toast.error(
        error?.message ||
          'Unable to open this conversation.'
      );
    } finally {
      setMessageLoadingId(null);
    }
  };

  const ProfileCard = ({
    profile,
    ringClass =
      'ring-primary/20',
    fallbackGradient =
      'bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6]',
    actions,
  }) => {
    if (!profile) {
      return null;
    }

    return (
      <Card className="group overflow-hidden border-border bg-card shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
        {/* Banner */}
        <button
          type="button"
          className="relative block w-full h-20 lg:h-24 overflow-hidden text-left"
          onClick={() =>
            openProfile(profile)
          }
          aria-label={`Open ${
            profile.full_name ||
            profile.username ||
            'user'
          } profile`}
        >
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#5B6CFF]/25 via-[#8B5CF6]/25 to-[#06B6D4]/30" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </button>

        <CardContent className="px-3 lg:px-4 pb-4 pt-0">
          {/* Profile picture */}
          <div className="-mt-8 lg:-mt-9 relative flex justify-center">
            <button
              type="button"
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() =>
                openProfile(profile)
              }
              aria-label={`Open ${
                profile.full_name ||
                profile.username ||
                'user'
              } profile`}
            >
              <Avatar
                className={`h-16 w-16 lg:h-[72px] lg:w-[72px] border-4 border-background shadow-md ring-2 ${ringClass} bg-background`}
              >
                <AvatarImage
                  src={
                    profile.avatar_url ||
                    undefined
                  }
                  alt={
                    profile.full_name ||
                    profile.username ||
                    'BizBase user'
                  }
                  className="object-cover"
                />

                <AvatarFallback
                  className={`${fallbackGradient} text-white text-base lg:text-lg font-semibold`}
                >
                  {getInitials(
                    profile.full_name,
                    profile.username
                  )}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>

          {/* Name */}
          <div className="text-center mt-2 min-w-0">
            <button
              type="button"
              className="block w-full text-center font-semibold text-sm lg:text-base text-foreground truncate hover:text-primary transition-colors focus:outline-none focus-visible:underline"
              onClick={() =>
                openProfile(profile)
              }
            >
              {profile.full_name ||
                profile.username ||
                'BizBase member'}
            </button>

            {/* About / Bio / Username */}
            <button
              type="button"
              className="block w-full mt-1 text-xs lg:text-sm text-muted-foreground line-clamp-2 min-h-[32px] hover:text-foreground transition-colors"
              onClick={() =>
                openProfile(profile)
              }
              title={getProfileAbout(
                profile
              )}
            >
              {getProfileAbout(
                profile
              )}
            </button>
          </div>

          {actions}
        </CardContent>
      </Card>
    );
  };

  const SuggestionCard = ({
    profile
  }) => (
    <ProfileCard
      profile={profile}
      actions={
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1 h-9 text-xs sm:text-sm bg-[#5B6CFF] hover:bg-[#4A5AEE] text-white"
            onClick={() =>
              sendRequest(
                profile.id
              )
            }
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Connect
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 shrink-0 text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50"
            onClick={() =>
              removeSuggestion(
                profile.id
              )
            }
            aria-label={`Remove ${
              profile.full_name ||
              profile.username ||
              'user'
            } from suggestions`}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      }
    />
  );

  const ConnectedCard = ({
    conn
  }) => {
    const profile =
      conn.requester_profile?.id ===
      user?.id
        ? conn.addressee_profile
        : conn.requester_profile;

    return (
      <ProfileCard
        profile={profile}
        ringClass="ring-green-500/30"
        fallbackGradient="bg-gradient-to-br from-[#10B981] to-[#059669]"
        actions={
          <Button
            className="w-full mt-4 h-9 text-xs sm:text-sm"
            variant="outline"
            size="sm"
            disabled={
              messageLoadingId ===
              profile?.id
            }
            onClick={() =>
              handleMessage(profile)
            }
          >
            {messageLoadingId ===
            profile?.id ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
            )}

            Message
          </Button>
        }
      />
    );
  };

  const RequestCard = ({
    req,
    type
  }) => {
    const profile =
      type === 'received'
        ? req.requester_profile
        : req.addressee_profile;

    return (
      <ProfileCard
        profile={profile}
        ringClass={
          type === 'received'
            ? 'ring-amber-500/30'
            : 'ring-blue-500/30'
        }
        fallbackGradient={
          type === 'received'
            ? 'bg-gradient-to-br from-amber-500 to-orange-500'
            : 'bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6]'
        }
        actions={
          type === 'received' ? (
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1 h-9 text-xs sm:text-sm bg-[#10B981] hover:bg-[#059669] text-white"
                size="sm"
                onClick={() =>
                  acceptRequest(
                    req.id
                  )
                }
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Accept
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs sm:text-sm"
                onClick={() =>
                  rejectRequest(
                    req.id
                  )
                }
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Decline
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs sm:text-sm text-muted-foreground"
                disabled
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Pending
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                onClick={() =>
                  withdrawRequest(
                    req.id
                  )
                }
                aria-label={`Withdraw request to ${
                  profile?.full_name ||
                  profile?.username ||
                  'user'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )
        }
      />
    );
  };

  const gridClass =
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4';

  return (
    <DashboardLayout>
      <SEOHead
        title="My Network | BizBase"
        description="Manage your professional connections and grow your network on BizBase."
        path="/connections"
      />

      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={
            setActiveTab
          }
        >
          <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10 lg:h-11 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger
              value="suggestions"
              className="text-[10px] sm:text-xs lg:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5B6CFF] data-[state=active]:to-[#8B5CF6] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1 lg:mr-2" />

              <span className="hidden sm:inline">
                Suggestions
              </span>

              <span className="sm:hidden">
                Suggest
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="connections"
              className="text-[10px] sm:text-xs lg:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10B981] data-[state=active]:to-[#059669] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1 lg:mr-2" />

              <span className="hidden sm:inline">
                Connected
              </span>

              <span className="sm:hidden">
                Connect
              </span>

              <Badge
                variant="secondary"
                className="ml-1 lg:ml-2 text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 lg:h-5"
              >
                {connections.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="requests"
              className="text-[10px] sm:text-xs lg:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1 lg:mr-2" />

              <span className="hidden sm:inline">
                Requests
              </span>

              <span className="sm:hidden">
                Req
              </span>

              <Badge
                variant="secondary"
                className="ml-1 lg:ml-2 text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 lg:h-5"
              >
                {receivedRequests.length +
                  sentRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* SUGGESTIONS */}
          <TabsContent
            value="suggestions"
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-[#5B6CFF]" />
                  People You May Know
                </h2>

                <p className="text-xs lg:text-sm text-muted-foreground">
                  Expand your professional network
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={
                  refreshSuggestions
                }
                disabled={
                  suggestionsLoading
                }
                className="h-8 text-xs"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${
                    suggestionsLoading
                      ? 'animate-spin'
                      : ''
                  }`}
                />

                Refresh
              </Button>
            </div>

            {suggestionsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-10 w-10 mx-auto mb-3 text-[#5B6CFF]" />

                <p className="text-sm text-muted-foreground">
                  Finding connections...
                </p>
              </div>
            ) : suggestions.length ===
              0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />

                <h3 className="text-base font-semibold mb-1">
                  No Suggestions
                </h3>

                <p className="text-sm text-muted-foreground">
                  Check back later for new connections
                </p>
              </div>
            ) : (
              <div
                className={
                  gridClass
                }
              >
                {suggestions.map(
                  (profile) => (
                    <SuggestionCard
                      key={
                        profile.id
                      }
                      profile={
                        profile
                      }
                    />
                  )
                )}
              </div>
            )}
          </TabsContent>

          {/* CONNECTED */}
          <TabsContent
            value="connections"
            className="mt-4"
          >
            <h2 className="text-lg lg:text-xl font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 text-[#10B981]" />
              My Connections
            </h2>

            <div className="relative mt-2 lg:mt-3 mb-4 lg:mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                placeholder="Search connections..."
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="pl-9 h-9 lg:h-10 text-sm lg:text-base rounded-[10px] w-full lg:max-w-md"
              />
            </div>

            {connectionsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-10 w-10 mx-auto mb-3 text-[#10B981]" />

                <p className="text-sm text-muted-foreground">
                  Loading connections...
                </p>
              </div>
            ) : filteredConnections.length ===
              0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />

                <h3 className="text-base font-semibold mb-1">
                  No Connections Yet
                </h3>

                <p className="text-sm text-muted-foreground mb-3">
                  Start building your network
                </p>

                <Button
                  size="sm"
                  onClick={() =>
                    setActiveTab(
                      'suggestions'
                    )
                  }
                >
                  <Users className="w-3 h-3 mr-1" />
                  Find Connections
                </Button>
              </div>
            ) : (
              <div
                className={
                  gridClass
                }
              >
                {filteredConnections.map(
                  (conn) => (
                    <ConnectedCard
                      key={
                        conn.id
                      }
                      conn={
                        conn
                      }
                    />
                  )
                )}
              </div>
            )}
          </TabsContent>

          {/* REQUESTS */}
          <TabsContent
            value="requests"
            className="mt-4"
          >
            <div className="mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-semibold flex items-center gap-2 mb-3">
                <UserPlus className="w-5 h-5 lg:w-6 lg:h-6 text-amber-500" />
                Connection Requests
              </h2>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={
                    requestsSubTab ===
                    'received'
                      ? 'default'
                      : 'outline'
                  }
                  className={`h-7 text-[10px] sm:text-xs px-2 sm:px-3 ${
                    requestsSubTab ===
                    'received'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : ''
                  }`}
                  onClick={() =>
                    setRequestsSubTab(
                      'received'
                    )
                  }
                >
                  <Clock className="w-3 h-3 mr-1" />

                  Received

                  <Badge
                    variant="secondary"
                    className="ml-1 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4"
                  >
                    {
                      receivedRequests.length
                    }
                  </Badge>
                </Button>

                <Button
                  size="sm"
                  variant={
                    requestsSubTab ===
                    'sent'
                      ? 'default'
                      : 'outline'
                  }
                  className={`h-7 text-[10px] sm:text-xs px-2 sm:px-3 ${
                    requestsSubTab ===
                    'sent'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : ''
                  }`}
                  onClick={() =>
                    setRequestsSubTab(
                      'sent'
                    )
                  }
                >
                  <Send className="w-3 h-3 mr-1" />

                  Sent

                  <Badge
                    variant="secondary"
                    className="ml-1 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-4"
                  >
                    {
                      sentRequests.length
                    }
                  </Badge>
                </Button>
              </div>
            </div>

            {requestsSubTab ===
              'received' &&
              (receivedRequests.length ===
              0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />

                  <h3 className="text-base font-semibold mb-1">
                    No Incoming Requests
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Connection requests will appear here
                  </p>
                </div>
              ) : (
                <div
                  className={
                    gridClass
                  }
                >
                  {receivedRequests.map(
                    (req) => (
                      <RequestCard
                        key={
                          req.id
                        }
                        req={req}
                        type="received"
                      />
                    )
                  )}
                </div>
              ))}

            {requestsSubTab ===
              'sent' &&
              (sentRequests.length ===
              0 ? (
                <div className="text-center py-12">
                  <Send className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />

                  <h3 className="text-base font-semibold mb-1">
                    No Sent Requests
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Your pending requests will appear here
                  </p>
                </div>
              ) : (
                <div
                  className={
                    gridClass
                  }
                >
                  {sentRequests.map(
                    (req) => (
                      <RequestCard
                        key={
                          req.id
                        }
                        req={req}
                        type="sent"
                      />
                    )
                  )}
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Connections;