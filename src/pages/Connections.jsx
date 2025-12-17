import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  UserCheck
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useConnections } from '@/hooks/useConnections';

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('connections');
  const [requestsSubTab, setRequestsSubTab] = useState('received');

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

  const SuggestionsTab = () => (
    <div className="space-y-6">
      <Card className="glass border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl gradient-text-primary">People You May Know</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Discover professionals in your industry and expand your network
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSuggestions}
              disabled={suggestionsLoading}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${suggestionsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {suggestionsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Finding perfect connections for you...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Suggestions Available</h3>
              <p className="text-muted-foreground">Check back later for new networking opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {suggestions.map((profile) => (
                <Card key={profile.id} className="card-professional hover-lift group">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Avatar
                        className="h-16 w-16 mx-auto mb-3 cursor-pointer ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" 
                        onClick={() => navigate(`/profile/${profile.id}`)}
                      >
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                          {profile.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <h4
                        className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors line-clamp-1"
                        onClick={() => navigate(`/profile/${profile.id}`)}
                      >
                        {profile.full_name}
                      </h4>
                      {profile.current_position && (
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <Briefcase className="w-3 h-3" />
                          {profile.current_position}
                        </p>
                      )}
                      {profile.industry && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {profile.industry}
                        </Badge>
                      )}
                      {profile.location && (
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 btn-professional"
                        onClick={() => sendRequest(profile.id)}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeSuggestion(profile.id)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 glass border-0 shadow-lg p-1 gap-1">
            <TabsTrigger value="suggestions"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:rounded-lg"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Suggestions</span>
              <span className="sm:hidden">Suggest</span>
            </TabsTrigger>

            <TabsTrigger value="connections"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:rounded-lg"
            >
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">My Connections</span>
              <span className="sm:hidden">Connect</span>
              <span className="ml-1">({connections.length})</span>
            </TabsTrigger>
            <TabsTrigger value="requests"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:rounded-lg"
            >
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Requests</span>
              <span className="sm:hidden">Req</span>
              <span className="ml-1">({receivedRequests.length + sentRequests.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* SUGGESTIONS */}
          <TabsContent value="suggestions">
            <SuggestionsTab />
          </TabsContent>

          {/* CONNECTIONS */}
          <TabsContent value="connections">
            <Card>
              <CardHeader>
                <CardTitle>My Connections</CardTitle>
                <Input
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </CardHeader>

              <CardContent>
                {connectionsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading your connections...</p>
                  </div>
                ) : filteredConnections.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">No Connections Yet</h3>
                    <p className="text-muted-foreground mb-4">Start building your professional network by connecting with others.</p>
                    <Button onClick={() => setActiveTab('suggestions')}>
                      <Users className="w-4 h-4 mr-2" />
                      Find Connections
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {filteredConnections.map(conn => {
                      const profile =
                        conn.requester_profile?.id === user?.id
                          ? conn.addressee_profile
                          : conn.requester_profile;

                      return (
                        <Card key={conn.id} className="card-professional hover-lift">
                          <CardContent className="p-4 text-center">
                            <Avatar 
                              className="mx-auto mb-2 h-16 w-16 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                              onClick={() => navigate(`/profile/${profile?.id}`)}
                            >
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                                {profile?.full_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <h3 
                              className="font-semibold cursor-pointer hover:text-primary transition-colors"
                              onClick={() => navigate(`/profile/${profile?.id}`)}
                            >
                              {profile?.full_name || 'Unknown User'}
                            </h3>
                            {profile?.current_position && (
                              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                <Briefcase className="w-3 h-3" />
                                {profile.current_position}
                              </p>
                            )}
                            {profile?.location && (
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {profile.location}
                              </p>
                            )}
                            <Badge className="mt-2" variant="secondary">Connected</Badge>

                            <div className="flex gap-2 mt-3">
                              <Button
                                className="flex-1"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/messages')}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => disconnect(conn.id)}
                                className="hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* REQUESTS */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Connection Requests</CardTitle>
                <Tabs value={requestsSubTab} onValueChange={setRequestsSubTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="received">Received</TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                {requestsSubTab === 'received' && (
                  receivedRequests.length === 0
                    ? (
                      <div className="text-center py-12">
                        <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">No Incoming Requests</h3>
                        <p className="text-muted-foreground">When someone sends you a connection request, it will appear here.</p>
                      </div>
                    )
                    : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {receivedRequests.map(req => {
                          const profile = req.requester_profile;
                          return (
                            <Card key={req.id} className="card-professional hover-lift">
                              <CardContent className="p-4 text-center">
                                <Avatar 
                                  className="mx-auto mb-2 h-14 w-14 cursor-pointer ring-2 ring-primary/20"
                                  onClick={() => navigate(`/profile/${profile?.id}`)}
                                >
                                  <AvatarImage src={profile?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                                    {profile?.full_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold">{profile?.full_name || 'Unknown User'}</h3>
                                {profile?.current_position && (
                                  <p className="text-sm text-muted-foreground">{profile.current_position}</p>
                                )}
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    className="flex-1 btn-professional"
                                    size="sm"
                                    onClick={() => acceptRequest(req.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => rejectRequest(req.id)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )
                )}

                {requestsSubTab === 'sent' && (
                  sentRequests.length === 0
                    ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">No Sent Requests</h3>
                        <p className="text-muted-foreground">Connection requests you send will appear here.</p>
                      </div>
                    )
                    : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sentRequests.map(req => {
                          const profile = req.addressee_profile;
                          return (
                            <Card key={req.id} className="card-professional">
                              <CardContent className="p-4 text-center">
                                <Avatar 
                                  className="mx-auto mb-2 h-14 w-14 cursor-pointer"
                                  onClick={() => navigate(`/profile/${profile?.id}`)}
                                >
                                  <AvatarImage src={profile?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                                    {profile?.full_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold">{profile?.full_name || 'Unknown User'}</h3>
                                {profile?.current_position && (
                                  <p className="text-sm text-muted-foreground">{profile.current_position}</p>
                                )}
                                <Badge className="mt-2" variant="secondary">
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Pending
                                </Badge>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Connections;