import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Users,
  UserPlus,
  MessageSquare,
  Filter,
  MapPin,
  Briefcase,
  Star,
  Loader2
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useConnections } from '@/hooks/useConnections';
// import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Network = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState(new Set());
  const [existingConnections, setExistingConnections] = useState(new Set());
  const [incomingRequests, setIncomingRequests] = useState(new Set());


  useEffect(() => {
    if (user) {
      const {
        connections,
        receivedRequests,
        sentRequests,
        sendRequest
      } = useConnections();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-network')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections'
        },
        () => {
          fetchExistingConnections();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchExistingConnections = async () => {
    if (!user) return;

    try {
      const { data: connections, error } = await supabase
        .from('connections')
        .select('addressee_id, requester_id, status')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      const connectedIds = new Set();
      const pendingIds = new Set();
      const receivedIds = new Set();

      connections?.forEach(conn => {
        if (conn.status === 'accepted') {
          const otherId =
            conn.requester_id === user.id
              ? conn.addressee_id
              : conn.requester_id;
          connectedIds.add(otherId);
        } 

        if (conn.status === 'pending') {
          if (conn.requester_id === user.id) {
            pendingIds.add(conn.addressee_id); // SENT
          }

          if (conn.addressee_id === user.id) {
            receivedIds.add(conn.requester_id); // RECEIVED
          }
        }
      });

      setExistingConnections(connectedIds);
      setConnectionRequests(pendingIds);
      setIncomingRequests(receivedIds);


    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchProfessionals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .not('full_name', 'eq', null);

      if (error) throw error;
      setProfessionals(profiles || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast({
        title: "Error",
        description: "Failed to load professionals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (profileId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: profileId,
          status: 'pending'
        });

      if (error) throw error;

      setConnectionRequests(prev => new Set([...prev, profileId]));
      toast({
        title: "Connection Request Sent!",
        description: "Your connection request has been sent successfully!"
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      if (error.code === '23505') {
        toast({
          title: "Already Connected",
          description: "You've already sent a request to this user",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send connection request",
          variant: "destructive"
        });
      }
    }
  };

  const filteredProfessionals = professionals.filter(prof =>
    (prof.full_name && prof.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (prof.company_name && prof.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (prof.current_position && prof.current_position.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (prof.industry && prof.industry.toLowerCase().includes(searchTerm.toLowerCase()))
);


  const getConnectionStatus = (profileId) => {
    if (connections.some(c =>
      c.requester_id === profileId || c.addressee_id === profileId
    )) return 'connected';

    if (sentRequests.some(r => r.addressee_id === profileId)) return 'sent';

    if (receivedRequests.some(r => r.requester_id === profileId)) return 'received';

    return 'none';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Professional Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search professionals, companies, or industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{filteredProfessionals.length} professionals found</span>
              <Badge variant="secondary">AI-Powered Matching</Badge>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading professionals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional) => {
              const status = getConnectionStatus(professional.id);
              
              return (
                <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar 
                        className="h-16 w-16 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
                        onClick={() => navigate(`/user-profile/${professional.id}`)}
                      >
                        <AvatarImage src={professional.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                          {professional.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 
                          className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => navigate(`/user-profile/${professional.id}`)}
                        >
                          {professional.full_name}
                        </h3>
                        {professional.current_position && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {professional.current_position}
                          </p>
                        )}
                        {professional.company_name && (
                          <p className="text-sm text-gray-500">
                            at {professional.company_name}
                          </p>
                        )}
                        {professional.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {professional.location}
                          </p>
                        )}
                        {professional.industry && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {professional.industry}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>AI Match Score: {Math.floor(Math.random() * 30) + 70}%</span>
                      </div>
                      <p className="text-xs text-purple-600">
                        🎯 Suggested based on your professional interests
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {status === 'connected' && <Button size="sm" variant="outline" disabled className="flex-1">Connected</Button>}
                      {status === 'sent' && <Button size="sm" variant="outline" disabled className="flex-1">Request Sent</Button>}
                      {status === 'received' && (
                        <Button size="sm" variant="outline" disabled className="flex-1">
                          Respond in Requests
                        </Button>
                      )}
                      {status === 'none' && (
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => sendRequest(professional.id)}> <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredProfessionals.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Professionals Found</h3>
              <p className="text-gray-600">Try adjusting your search terms or check back later for new members.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Network;