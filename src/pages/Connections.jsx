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

  // Use the connections hook at the top level
  const {
    connections,
    receivedRequests,
    sentRequests,
    suggestions,
    suggestionsLoading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    loading: connectionsLoading,
    refreshSuggestions,
    removeSuggestion
  } = useConnections();


  useEffect(() => {
    if (!user) {
      return;
    }
  }, [user]);

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections">
              <UserCheck className="w-4 h-4 mr-2" />
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserPlus className="w-4 h-4 mr-2" />
              Requests ({receivedRequests.length + sentRequests.length})
            </TabsTrigger>
          </TabsList>

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
                  <p>Loading...</p>
                ) : filteredConnections.length === 0 ? (
                  <p>No connections yet.</p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {filteredConnections.map(conn => {
                      const profile =
                        conn.requester_profile?.id === user?.id
                          ? conn.addressee_profile
                          : conn.requester_profile;

                      return (
                        <Card key={conn.id}>
                          <CardContent className="p-4 text-center">
                            <Avatar className="mx-auto mb-2">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback>
                                {profile?.full_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">
                              {profile?.full_name}
                            </h3>
                            <Badge className="mt-2">Connected</Badge>

                            <Button
                              className="mt-3 w-full"
                              variant="outline"
                              onClick={() => navigate('/messages')}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
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
                    ? <p>No incoming requests.</p>
                    : receivedRequests.map(req => {
                        const profile = req.requester_profile;
                        return (
                          <Card key={req.id} className="mb-3">
                            <CardContent className="p-4 text-center">
                              <h3>{profile?.full_name}</h3>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  className="flex-1"
                                  onClick={() => acceptRequest(req.id)}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
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
                      })
                )}

                {requestsSubTab === 'sent' && (
                  sentRequests.length === 0
                    ? <p>No sent requests.</p>
                    : sentRequests.map(req => (
                        <Card key={req.id} className="mb-3">
                          <CardContent className="p-4 text-center">
                            <h3>{req.addressee_profile?.full_name}</h3>
                            <Badge className="mt-2">Request Sent</Badge>
                          </CardContent>
                        </Card>
                      ))
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