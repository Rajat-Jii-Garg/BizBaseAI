import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import DashboardLayout from '@/components/DashboardLayout';
import { useConnections } from '@/hooks/useConnections';

const Connections = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'received' ? 'requests' : 'connections');
  const [requestsSubTab, setRequestsSubTab] = useState(tabFromUrl === 'received' ? 'received' : 'received');

  useEffect(() => {
    if (tabFromUrl === 'received') {
      setActiveTab('requests');
      setRequestsSubTab('received');
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
    disconnect,
    withdrawRequest,
    refreshSuggestions,
    removeSuggestion,
    refreshAllConnections
  } = useConnections();

  const filteredConnections = connections.filter(conn => {
    const profile =
      conn.requester_profile?.id === user?.id
        ? conn.addressee_profile
        : conn.requester_profile;

    return (
      profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile?.current_position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile?.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Shared profile card shell used by Connect, Received, and Sent tabs
  const ProfileCard = ({ profile, bannerUrl, bannerGradient, ringClass, fallbackGradient, badge, actions }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card">
      <div 
        className="h-10 lg:h-16 bg-cover bg-center"
        style={{
          backgroundImage: bannerUrl 
            ? `url(${bannerUrl})`
            : bannerGradient || 'linear-gradient(135deg, rgba(91,108,255,0.3), rgba(139,92,246,0.3), rgba(6,182,212,0.3))'
        }}
      />
      <CardContent className="p-3 lg:p-4 pt-0 -mt-5 lg:-mt-7">
        <div className="text-center">
          <Avatar 
            className={`h-10 w-10 lg:h-14 lg:w-14 mx-auto border-2 border-background cursor-pointer ${ringClass || 'ring-2 ring-primary/20'}`}
            onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile?.id}`)}
          >
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className={`${fallbackGradient || 'bg-gradient-to-br from-primary to-primary/80'} text-white text-sm lg:text-base font-semibold`}>
              {profile?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <h3 
            className="font-semibold text-sm lg:text-base mt-2 cursor-pointer hover:text-primary transition-colors line-clamp-1"
            onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile?.id}`)}
          >
            {profile?.full_name || 'Unknown User'}
          </h3>
          {profile?.bio && (
            <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2 mt-1">{profile.bio}</p>
          )}
          {badge}
        </div>
        {actions}
      </CardContent>
    </Card>
  );

  // Suggestion Card
  const SuggestionCard = ({ profile }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card">
      <div className="h-12 lg:h-16 bg-gradient-to-r from-[hsl(var(--primary))]/30 via-[#8B5CF6]/30 to-[#06B6D4]/30" />
      <CardContent className="p-3 lg:p-4 pt-0 -mt-6 lg:-mt-8">
        <div className="text-center">
          <Avatar
            className="h-12 w-12 lg:h-14 lg:w-14 mx-auto border-2 border-background cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all" 
            onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile.id}`)}
          >
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] text-white text-sm lg:text-base font-semibold">
              {profile.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <h4
            className="font-semibold text-sm lg:text-base mt-2 cursor-pointer hover:text-primary transition-colors line-clamp-1"
            onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile.id}`)}
          >
            {profile.full_name}
          </h4>
          {profile.bio && (
            <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2 mt-1">{profile.bio}</p>
          )}
          {profile.industry && (
            <Badge variant="secondary" className="mt-2 text-[10px] lg:text-xs px-2 py-0">
              {profile.industry}
            </Badge>
          )}
        </div>
        <div className="flex gap-1.5 mt-3">
          <Button
            size="sm"
            className="flex-1 h-7 lg:h-8 text-xs lg:text-sm bg-[#5B6CFF] hover:bg-[#4A5AEE] text-white"
            onClick={() => sendRequest(profile.id)}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Connect
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 lg:h-8 w-7 lg:w-8 p-0"
            onClick={() => removeSuggestion(profile.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Connected User Card
  const ConnectedCard = ({ conn }) => {
    const profile = conn.requester_profile?.id === user?.id
      ? conn.addressee_profile
      : conn.requester_profile;

    return (
      <ProfileCard
        profile={profile}
        bannerUrl={profile?.banner_url}
        ringClass="ring-2 ring-green-500/30"
        fallbackGradient="bg-gradient-to-br from-[#10B981] to-[#059669]"
        badge={
          <Badge className="mt-2 text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
            <UserCheck className="w-2.5 h-2.5 mr-1" />
            Connected
          </Badge>
        }
        actions={
          <Button
            className="w-full mt-3 h-7 text-xs"
            variant="outline"
            size="sm"
            onClick={() => navigate('/messages')}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Message
          </Button>
        }
      />
    );
  };

  // Request Card - same visual as ConnectedCard
  const RequestCard = ({ req, type }) => {
    const profile = type === 'received' ? req.requester_profile : req.addressee_profile;
    
    return (
      <ProfileCard
        profile={profile}
        bannerUrl={profile?.banner_url}
        bannerGradient={type === 'received' 
          ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(249,115,22,0.25), rgba(239,68,68,0.25))'
          : 'linear-gradient(135deg, rgba(91,108,255,0.25), rgba(139,92,246,0.25), rgba(6,182,212,0.25))'
        }
        ringClass={type === 'received' ? 'ring-2 ring-amber-500/30' : 'ring-2 ring-blue-500/30'}
        fallbackGradient={type === 'received' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6]'}
        badge={
          <Badge className={`mt-2 text-[10px] ${type === 'received' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}`} variant="outline">
            {type === 'received' ? (
              <><Clock className="w-2.5 h-2.5 mr-1" />Pending</>
            ) : (
              <><Send className="w-2.5 h-2.5 mr-1" />Sent</>
            )}
          </Badge>
        }
        actions={
          type === 'received' ? (
            <div className="flex gap-1.5 mt-3">
              <Button
                className="flex-1 h-7 text-xs bg-[#10B981] hover:bg-[#059669] text-white"
                size="sm"
                onClick={() => acceptRequest(req.id)}
              >
                <Check className="w-3 h-3 mr-1" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => rejectRequest(req.id)}
              >
                <X className="w-3 h-3 mr-1" />
                Decline
              </Button>
            </div>
          ) : (
            <div className="flex gap-1.5 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs text-muted-foreground"
                disabled
              >
                <Clock className="w-3 h-3 mr-1" />
                Awaiting
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => withdrawRequest(req.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )
        }
      />
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-3 sm:p-4 space-y-4">

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Compact Tab Buttons - smaller on mobile */}
          <TabsList className="grid w-full grid-cols-3 h-8 sm:h-9 lg:h-11 p-0.5 sm:p-1 bg-muted/50 rounded-xl">
            <TabsTrigger 
              value="suggestions"
              className="text-[10px] sm:text-xs lg:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5B6CFF] data-[state=active]:to-[#8B5CF6] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 mr-0.5 sm:mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Suggestions</span>
              <span className="sm:hidden">Suggest</span>
            </TabsTrigger>

            <TabsTrigger 
              value="connections"
              className="text-[10px] sm:text-xs lg:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10B981] data-[state=active]:to-[#059669] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <UserCheck className="w-3 h-3 lg:w-4 lg:h-4 mr-0.5 sm:mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Connected</span>
              <span className="sm:hidden">Connect</span>
              <Badge variant="secondary" className="ml-0.5 sm:ml-1 lg:ml-2 text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 lg:h-5">
                {connections.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger 
              value="requests"
              className="text-[10px] sm:text-xs lg:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <UserPlus className="w-3 h-3 lg:w-4 lg:h-4 mr-0.5 sm:mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Requests</span>
              <span className="sm:hidden">Req</span>
              <Badge variant="secondary" className="ml-0.5 sm:ml-1 lg:ml-2 text-[9px] sm:text-[10px] lg:text-xs px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 lg:h-5">
                {receivedRequests.length + sentRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* SUGGESTIONS TAB */}
          <TabsContent value="suggestions" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#5B6CFF]" />
                  People You May Know
                </h2>
                <p className="text-xs text-muted-foreground">Expand your professional network</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSuggestions}
                disabled={suggestionsLoading}
                className="h-8 text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${suggestionsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {suggestionsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-10 w-10 mx-auto mb-3 text-[#5B6CFF]" />
                <p className="text-sm text-muted-foreground">Finding connections...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="text-base font-semibold mb-1">No Suggestions</h3>
                <p className="text-sm text-muted-foreground">Check back later for new connections</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {suggestions.map((profile) => (
                  <SuggestionCard key={profile.id} profile={profile} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* CONNECTIONS TAB */}
          <TabsContent value="connections" className="mt-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#10B981]" />
              My Connections
            </h2>
            <div className="relative mt-2 mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search connections..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm rounded-[10px] w-full"
              />
            </div>

            {connectionsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-10 w-10 mx-auto mb-3 text-[#10B981]" />
                <p className="text-sm text-muted-foreground">Loading connections...</p>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="text-base font-semibold mb-1">No Connections Yet</h3>
                <p className="text-sm text-muted-foreground mb-3">Start building your network</p>
                <Button size="sm" onClick={() => setActiveTab('suggestions')}>
                  <Users className="w-3 h-3 mr-1" />
                  Find Connections
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredConnections.map(conn => (
                  <ConnectedCard key={conn.id} conn={conn} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* REQUESTS TAB */}
          <TabsContent value="requests" className="mt-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <UserPlus className="w-5 h-5 text-amber-500" />
                Connection Requests
              </h2>
              
              {/* Sub-tabs for Received/Sent */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={requestsSubTab === 'received' ? 'default' : 'outline'}
                  className={`h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-3 ${requestsSubTab === 'received' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                  onClick={() => setRequestsSubTab('received')}
                >
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  Received
                  <Badge variant="secondary" className="ml-1 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4">
                    {receivedRequests.length}
                  </Badge>
                </Button>
                <Button
                  size="sm"
                  variant={requestsSubTab === 'sent' ? 'default' : 'outline'}
                  className={`h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-3 ${requestsSubTab === 'sent' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                  onClick={() => setRequestsSubTab('sent')}
                >
                  <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  Sent
                  <Badge variant="secondary" className="ml-1 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4">
                    {sentRequests.length}
                  </Badge>
                </Button>
              </div>
            </div>

            {requestsSubTab === 'received' && (
              receivedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="text-base font-semibold mb-1">No Incoming Requests</h3>
                  <p className="text-sm text-muted-foreground">Connection requests will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {receivedRequests.map(req => (
                    <RequestCard key={req.id} req={req} type="received" />
                  ))}
                </div>
              )
            )}

            {requestsSubTab === 'sent' && (
              sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="text-base font-semibold mb-1">No Sent Requests</h3>
                  <p className="text-sm text-muted-foreground">Your pending requests will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {sentRequests.map(req => (
                    <RequestCard key={req.id} req={req} type="sent" />
                  ))}
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Connections;
