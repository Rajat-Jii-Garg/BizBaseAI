
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
  RefreshCw
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

      // Get random users that are not connected
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'eq', user.id)
        .not('id', 'in', `(${Array.from(connectedUserIds).join(',') || 'null'})`)
        .limit(6);

      if (error) throw error;
      setSuggestions(profiles || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
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

      fetchSuggestions(); // Refresh suggestions
      fetchSentRequests(); // Refresh sent requests
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

  const SuggestionsSection = () => (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">People You May Know</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSuggestions}
            disabled={suggestionsLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${suggestionsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestionsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No suggestions available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar 
                      className="h-12 w-12 cursor-pointer" 
                      onClick={() => navigate(`/profile/${profile.id}`)}
                    >
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                        {profile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 
                        className="font-semibold text-sm cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/profile/${profile.id}`)}
                      >
                        {profile.full_name}
                      </h4>
                      {profile.current_position && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {profile.current_position}
                        </p>
                      )}
                      {profile.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleSendConnectionRequest(profile.id)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/messages`)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections">
              My Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            <Card>
              <CardHeader>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search your connections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading connections...</p>
                  </div>
                ) : filteredConnections.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Connections Found</h3>
                    <p className="text-gray-600">Start connecting with professionals to grow your network.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredConnections.map((connection) => (
                      <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar 
                              className="h-16 w-16 cursor-pointer" 
                              onClick={() => navigate(`/profile/${connection.profile?.id}`)}
                            >
                              <AvatarImage src={connection.profile?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                                {connection.profile?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 
                                className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-primary"
                                onClick={() => navigate(`/profile/${connection.profile?.id}`)}
                              >
                                {connection.profile?.full_name}
                              </h3>
                              {connection.profile?.current_position && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  {connection.profile.current_position}
                                </p>
                              )}
                              {connection.profile?.company_name && (
                                <p className="text-sm text-gray-500">
                                  at {connection.profile.company_name}
                                </p>
                              )}
                              {connection.profile?.location && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {connection.profile.location}
                                </p>
                              )}
                            </div>
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
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <SuggestionsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Connection Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                    <p className="text-gray-600">You don't have any pending connection requests.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar 
                            className="h-12 w-12 cursor-pointer" 
                            onClick={() => navigate(`/profile/${request.profiles?.id}`)}
                          >
                            <AvatarImage src={request.profiles?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                              {request.profiles?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 
                              className="font-semibold cursor-pointer hover:text-primary"
                              onClick={() => navigate(`/profile/${request.profiles?.id}`)}
                            >
                              {request.profiles?.full_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {request.profiles?.current_position} at {request.profiles?.company_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <SuggestionsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Sent Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {sentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sent Requests</h3>
                    <p className="text-gray-600">You haven't sent any connection requests yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar 
                            className="h-12 w-12 cursor-pointer" 
                            onClick={() => navigate(`/profile/${request.profiles?.id}`)}
                          >
                            <AvatarImage src={request.profiles?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                              {request.profiles?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 
                              className="font-semibold cursor-pointer hover:text-primary"
                              onClick={() => navigate(`/profile/${request.profiles?.id}`)}
                            >
                              {request.profiles?.full_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {request.profiles?.current_position} at {request.profiles?.company_name}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <SuggestionsSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Connections;
