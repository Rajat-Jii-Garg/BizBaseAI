import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Connections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [requestsSubTab, setRequestsSubTab] = useState('received');

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchPendingRequests();
      fetchSentRequests();
      fetchSuggestions();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      const { data: connectionData, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester_profile:profiles!connections_requester_id_fkey (*),
          addressee_profile:profiles!connections_addressee_id_fkey (*)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      const processedConnections = connectionData?.map(conn => {
        const isRequester = conn.requester_id === user.id;
        const profile = isRequester ? conn.addressee_profile : conn.requester_profile;
        return {
          ...conn,
          profile
        };
      }) || [];

      setConnections(processedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!user) return;

    try {
      const { data: requests, error } = await supabase
        .from('connections')
        .select(`
          *,
          profiles!connections_requester_id_fkey (*)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(requests || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchSentRequests = async () => {
    if (!user) return;

    try {
      const { data: requests, error } = await supabase
        .from('connections')
        .select(`
          *,
          profiles!connections_addressee_id_fkey (*)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setSentRequests(requests || []);
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const fetchSuggestions = async () => {
    if (!user) return;
    
    setSuggestionsLoading(true);
    try {
      // Get user's profile to match by industry
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('industry')
        .eq('id', user.id)
        .single();

      // Get connected user IDs and pending request IDs
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const connectedUserIds = new Set();
      existingConnections?.forEach(conn => {
        connectedUserIds.add(conn.requester_id);
        connectedUserIds.add(conn.addressee_id);
      });

      // Get suggestions: prioritize same industry, then random
      let query = supabase
        .from('profiles')
        .select('*')
        .not('id', 'eq', user.id)
        .not('full_name', 'is', null);

      if (Array.from(connectedUserIds).length > 0) {
        query = query.not('id', 'in', `(${Array.from(connectedUserIds).join(',')})`);
      }

      const { data: allProfiles, error } = await query.limit(20);

      if (error) throw error;

      // Prioritize profiles from same industry
      const sameIndustry = allProfiles?.filter(p => 
        userProfile?.industry && p.industry === userProfile.industry
      ) || [];
      
      const otherProfiles = allProfiles?.filter(p => 
        !userProfile?.industry || p.industry !== userProfile.industry
      ) || [];

      // Mix both arrays and take first 8
      const mixedSuggestions = [...sameIndustry, ...otherProfiles].slice(0, 8);
      setSuggestions(mixedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const removeSuggestion = (profileId) => {
    setSuggestions(prev => prev.filter(s => s.id !== profileId));
    toast({
      title: "Suggestion Removed",
      description: "This profile has been removed from your suggestions."
    });
  };

  const handleSendConnectionRequest = async (profileId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert([{
          requester_id: user.id,
          addressee_id: profileId,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully."
      });

      // Remove from suggestions and refresh sent requests
      removeSuggestion(profileId);
      fetchSentRequests();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Connection Accepted",
        description: "You have successfully accepted the connection request."
      });

      fetchConnections();
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection request",
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Connection Rejected",
        description: "You have rejected the connection request."
      });

      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject connection request",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async (connectionId) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Connection Removed",
        description: "You have successfully removed this connection."
      });
      
      fetchConnections();
      fetchSuggestions(); // Refresh suggestions
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive"
      });
    }
  };

  const filteredConnections = connections.filter(conn =>
    conn.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.profile?.current_position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onClick={fetchSuggestions}
              disabled={suggestionsLoading}
              className="hover-lift"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                        onClick={() => handleSendConnectionRequest(profile.id)}
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
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text-primary mb-2">My Network</h1>
          <p className="text-muted-foreground text-lg">Build meaningful professional connections</p>
        </div> */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass border-0 shadow-lg">
            <TabsTrigger 
              value="suggestions" 
              className="className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger 
              value="connections" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:rounded-lg"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              My Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:rounded-lg"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Requests ({pendingRequests.length + sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="animate-fade-in">
            <SuggestionsTab />
          </TabsContent>

          <TabsContent value="connections" className="animate-fade-in">
            <Card className="glass border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl gradient-text-primary mb-2">My Professional Network</CardTitle>
                    <p className="text-muted-foreground text-sm">Manage your professional connections</p>
                  </div>
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search your connections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 input-focus"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your network...</p>
                  </div>
                ) : filteredConnections.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold mb-2">No connections yet</h3>
                    <p className="text-muted-foreground mb-4">Start building your professional network today!</p>
                    <Button 
                      onClick={() => setActiveTab('suggestions')}
                      className="btn-professional"
                    >
                      Explore Connections
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredConnections.map((connection) => (
                      <Card key={connection.id} className="card-professional hover-lift group">
                        <CardContent className="p-6">
                          <div className="text-center mb-4">
                            <Avatar 
                              className="h-16 w-16 mx-auto mb-3 cursor-pointer ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" 
                              onClick={() => navigate(`/profile/${connection.profile?.id}`)}
                            >
                              <AvatarImage src={connection.profile?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                                {connection.profile?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <h3 
                              className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors line-clamp-1"
                              onClick={() => navigate(`/profile/${connection.profile?.id}`)}
                            >
                              {connection.profile?.full_name}
                            </h3>
                            {connection.profile?.current_position && (
                              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                <Briefcase className="w-3 h-3" />
                                {connection.profile.current_position}
                              </p>
                            )}
                            {connection.profile?.company_name && (
                              <p className="text-sm text-muted-foreground mt-1">
                                at {connection.profile.company_name}
                              </p>
                            )}
                            {connection.profile?.location && (
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2">
                                <MapPin className="w-3 h-3" />
                                {connection.profile.location}
                              </p>
                            )}
                            <Badge variant="secondary" className="mt-2">Connected</Badge>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => navigate('/messages')}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDisconnect(connection.id)}
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="animate-fade-in">
            <Card className="glass border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl gradient-text-primary">Connection Requests</CardTitle>
                <Tabs value={requestsSubTab} onValueChange={setRequestsSubTab} className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="received">
                      Received ({pendingRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="sent">
                      Sent ({sentRequests.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <Tabs value={requestsSubTab} onValueChange={setRequestsSubTab}>
                  <TabsContent value="received">
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold mb-2">No Active Requests</h3>
                        <p className="text-muted-foreground mb-4">You don't have any pending connection requests.</p>
                        <Button 
                          onClick={() => setActiveTab('suggestions')}
                          className="btn-professional"
                        >
                          Explore Connections
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingRequests.map((request) => (
                          <Card key={request.id} className="card-professional hover-lift group">
                            <CardContent className="p-6">
                              <div className="text-center mb-4">
                                <Avatar 
                                  className="h-16 w-16 mx-auto mb-3 cursor-pointer ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all" 
                                  onClick={() => navigate(`/profile/${request.profiles?.id}`)}
                                >
                                  <AvatarImage src={request.profiles?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                                    {request.profiles?.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 
                                  className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors line-clamp-1"
                                  onClick={() => navigate(`/profile/${request.profiles?.id}`)}
                                >
                                  {request.profiles?.full_name}
                                </h3>
                                {request.profiles?.current_position && (
                                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                    <Briefcase className="w-3 h-3" />
                                    {request.profiles.current_position}
                                  </p>
                                )}
                                {request.profiles?.location && (
                                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2">
                                    <MapPin className="w-3 h-3" />
                                    {request.profiles.location}
                                  </p>
                                )}
                                <Badge variant="outline" className="mt-2">Wants to connect</Badge>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => handleAcceptRequest(request.id)}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRejectRequest(request.id)}
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sent">
                    {sentRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold mb-2">No Sent Requests</h3>
                        <p className="text-muted-foreground mb-4">You haven't sent any connection requests yet.</p>
                        <Button 
                          onClick={() => setActiveTab('suggestions')}
                          className="btn-professional"
                        >
                          Find People to Connect
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sentRequests.map((request) => (
                          <Card key={request.id} className="card-professional">
                            <CardContent className="p-6">
                              <div className="text-center">
                                <Avatar 
                                  className="h-16 w-16 mx-auto mb-3 cursor-pointer ring-2 ring-primary/20" 
                                  onClick={() => navigate(`/profile/${request.profiles?.id}`)}
                                >
                                  <AvatarImage src={request.profiles?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                                    {request.profiles?.full_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 
                                  className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors line-clamp-1"
                                  onClick={() => navigate(`/profile/${request.profiles?.id}`)}
                                >
                                  {request.profiles?.full_name}
                                </h3>
                                {request.profiles?.current_position && (
                                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                    <Briefcase className="w-3 h-3" />
                                    {request.profiles.current_position}
                                  </p>
                                )}
                                {request.profiles?.location && (
                                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2">
                                    <MapPin className="w-3 h-3" />
                                    {request.profiles.location}
                                  </p>
                                )}
                                <Badge variant="outline" className="mt-3 bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Request Sent
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Connections;