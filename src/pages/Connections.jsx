import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  UserMinus,
  UserPlus,
  MapPin,
  Briefcase,
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

  // Suggestion Card Component
  const SuggestionCard = ({ profile }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card">
      {/* Mini Banner */}
      <div className="h-12 bg-gradient-to-r from-[#5B6CFF]/30 via-[#8B5CF6]/30 to-[#06B6D4]/30" />
      <CardContent className="p-3 pt-0 -mt-6">
        <div className="text-center">
          <Avatar
            className="h-12 w-12 mx-auto border-2 border-background cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all" 
            onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile.id}`)}
          >
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-[#5B6CFF] to-[#8B5CF6] text-white text-sm font-semibold">
              {profile.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <h4
            className="font-semibold text-sm mt-2 cursor-pointer hover:text-primary transition-colors line-clamp-1"
            onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile.id}`)}
          >
            {profile.full_name}
          </h4>
          {profile.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{profile.bio}</p>
          )}
          {profile.industry && (
            <Badge variant="secondary" className="mt-2 text-[10px] px-2 py-0">
              {profile.industry}
            </Badge>
          )}
        </div>
        <div className="flex gap-1.5 mt-3">
          <Button
            size="sm"
            className="flex-1 h-7 text-xs bg-[#5B6CFF] hover:bg-[#4A5AEE] text-white"
            onClick={() => sendRequest(profile.id)}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Connect
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            onClick={() => removeSuggestion(profile.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Connected User Card Component
  const ConnectedCard = ({ conn }) => {
    const profile = conn.requester_profile?.id === user?.id
      ? conn.addressee_profile
      : conn.requester_profile;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card">
        {/* Mini Banner */}
        <div 
          className="h-10 bg-cover bg-center"
          style={{
            backgroundImage: profile?.banner_url 
              ? `url(${profile.banner_url})`
              : 'linear-gradient(135deg, rgba(91,108,255,0.3), rgba(139,92,246,0.3), rgba(6,182,212,0.3))'
          }}
        />
        <CardContent className="p-3 pt-0 -mt-5">
          <div className="text-center">
            <Avatar 
              className="h-10 w-10 mx-auto border-2 border-background cursor-pointer ring-2 ring-green-500/30"
              onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile?.id}`)}
            >
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white text-sm font-semibold">
                {profile?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <h3 
              className="font-semibold text-sm mt-2 cursor-pointer hover:text-primary transition-colors line-clamp-1"
              onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile?.id}`)}
            >
              {profile?.full_name || 'Unknown User'}
            </h3>
            {profile?.bio && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{profile.bio}</p>
            )}
            <Badge className="mt-2 text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
              <UserCheck className="w-2.5 h-2.5 mr-1" />
              Connected
            </Badge>
          </div>
          <Button
            className="w-full mt-3 h-7 text-xs"
            variant="outline"
            size="sm"
            onClick={() => navigate('/messages')}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Message
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Request Card Component
  const RequestCard = ({ req, type }) => {
    const profile = type === 'received' ? req.requester_profile : req.addressee_profile;
    
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card">
        <div className="h-10 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20" />
        <CardContent className="p-3 pt-0 -mt-5">
          <div className="text-center">
            <Avatar 
              className="h-10 w-10 mx-auto border-2 border-background cursor-pointer"
              onClick={() => profile?.username ? navigate(`/@${profile.username}`) : navigate(`/profile/${profile?.id}`)}
            >
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-semibold">
                {profile?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-sm mt-2 line-clamp-1">
              {profile?.full_name || 'Unknown User'}
            </h3>
            {profile?.current_position && (
              <p className="text-xs text-muted-foreground line-clamp-1">{profile.current_position}</p>
            )}
            <Badge className="mt-2 text-[10px]" variant="outline">
              {type === 'received' ? (
                <><Clock className="w-2.5 h-2.5 mr-1" />Pending</>
              ) : (
                <><Send className="w-2.5 h-2.5 mr-1" />Sent</>
              )}
            </Badge>
          </div>
          
          {type === 'received' ? (
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
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 h-7 text-xs text-muted-foreground"
              disabled
            >
              <Clock className="w-3 h-3 mr-1" />
              Awaiting Response
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-3 sm:p-4 space-y-4">

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Compact Tab Buttons */}
          <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger 
              value="suggestions"
              className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5B6CFF] data-[state=active]:to-[#8B5CF6] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Suggestions</span>
              <span className="sm:hidden">Suggest</span>
            </TabsTrigger>

            <TabsTrigger 
              value="connections"
              className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10B981] data-[state=active]:to-[#059669] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Connected</span>
              <span className="sm:hidden">Connect</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                {connections.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger 
              value="requests"
              className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Requests</span>
              <span className="sm:hidden">Req</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#10B981]" />
                  My Connections
                </h2>
                <p className="text-xs text-muted-foreground">{connections.length} professionals connected</p>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
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
                  className={`h-7 text-xs ${requestsSubTab === 'received' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                  onClick={() => setRequestsSubTab('received')}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Received
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                    {receivedRequests.length}
                  </Badge>
                </Button>
                <Button
                  size="sm"
                  variant={requestsSubTab === 'sent' ? 'default' : 'outline'}
                  className={`h-7 text-xs ${requestsSubTab === 'sent' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                  onClick={() => setRequestsSubTab('sent')}
                >
                  <Send className="w-3 h-3 mr-1" />
                  Sent
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
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
