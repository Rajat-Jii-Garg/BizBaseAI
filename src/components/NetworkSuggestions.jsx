import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, MapPin, Briefcase, RefreshCw } from 'lucide-react';

const NetworkSuggestions = ({ limit = 5 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSuggestions();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      
      // Get users who are not already connected and not the current user
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const connectedUserIds = new Set();
      existingConnections?.forEach(conn => {
        if (conn.requester_id !== user.id) connectedUserIds.add(conn.requester_id);
        if (conn.addressee_id !== user.id) connectedUserIds.add(conn.addressee_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name, industry, location, skills')
        .neq('id', user.id)
        .not('full_name', 'is', null)
        .limit(limit * 2); // Get more to filter out connected users

      const filteredSuggestions = profiles?.filter(profile => 
        !connectedUserIds.has(profile.id)
      ).slice(0, limit) || [];

      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Error fetching network suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (profileId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user?.id,
          addressee_id: profileId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection Request Sent!",
        description: "Your connection request has been sent successfully."
      });

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => s.id !== profileId));
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length > 0 ? (
          suggestions.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar 
                  className="h-10 w-10 cursor-pointer"
                  onClick={() => navigate(`/user-profile/${profile.id}`)}
                >
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-medium">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/user-profile/${profile.id}`)}
                  >
                    {profile.full_name}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {profile.current_position} 
                    {profile.company_name && ` at ${profile.company_name}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.location && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {profile.location}
                      </div>
                    )}
                    {profile.industry && (
                      <Badge variant="outline" className="text-xs">
                        {profile.industry}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleConnect(profile.id)}
                className="ml-2 shrink-0"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Connect
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No new suggestions available</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchSuggestions}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/network')}
            >
              View All Connections
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkSuggestions;