import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useConnections = () => {
  const { user } = useAuth();

  const [connections, setConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const fetchConnections = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch connections without foreign key relationships
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (connectionsError) throw connectionsError;

      if (!connectionsData || connectionsData.length === 0) {
        setConnections([]);
        setReceivedRequests([]);
        setSentRequests([]);
        setLoading(false);
        return;
      }

      // Get all unique user IDs to fetch profiles
      const userIds = new Set();
      connectionsData.forEach(conn => {
        if (conn.requester_id !== user.id) userIds.add(conn.requester_id);
        if (conn.addressee_id !== user.id) userIds.add(conn.addressee_id);
      });

      // Fetch profiles for all connected users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, location, skills')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create a map for quick profile lookup
      const profilesMap = {};
      profilesData?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      // Enrich connections with profile data
      const enrichedConnections = connectionsData.map(conn => ({
        ...conn,
        requester_profile: profilesMap[conn.requester_id] || null,
        addressee_profile: profilesMap[conn.addressee_id] || null
      }));

      const accepted = [];
      const received = [];
      const sent = [];

      enrichedConnections.forEach(conn => {
        if (conn.status === 'accepted') accepted.push(conn);

        if (conn.status === 'pending') {
          if (conn.addressee_id === user.id) received.push(conn);
          if (conn.requester_id === user.id) sent.push(conn);
        }
      });

      setConnections(accepted);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (err) {
      console.error('Error fetching connections:', err);
      // Don't show toast for every error - only log it
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!user) {
      return;
    }
    
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
        if (conn.requester_id !== user.id)
          connectedUserIds.add(conn.requester_id);

        if (conn.addressee_id !== user.id)
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
    toast.success("Suggestion removed from your list");
  };

  const connect = async (addresseeId) => {
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase.from('connections').insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending'
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Connection request already exists');
        } else {
          throw error;
        }
      } else {
        toast.success('Connection request sent');
        await fetchConnections();
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
      toast.error('Failed to send connection request');
      throw err;
    }
  };

  const acceptRequest = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Connection request accepted');
      await fetchConnections();
    } catch (err) {
      console.error('Error accepting request:', err);
      toast.error('Failed to accept request');
    }
  };

  const rejectRequest = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
      
      toast.success('Connection request rejected');
      await fetchConnections();
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast.error('Failed to reject request');
    }
  };

  const disconnect = async (connectionId) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast.success("Connection removed successfully");
      
      await fetchConnections();
      await fetchSuggestions();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error("Failed to remove connection");
    }
  };

  // Initialize and setup realtime subscription
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchConnections().then(fetchSuggestions);

    const channel = supabase
      .channel(`connections_${user.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connections' },
        (payload) => {
          if (
            payload.new?.requester_id === user.id ||
            payload.new?.addressee_id === user.id ||
            payload.old?.requester_id === user.id ||
            payload.old?.addressee_id === user.id
          ) {
            fetchConnections();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    // states
    loading,
    connections,
    receivedRequests,
    sentRequests,
    suggestions,
    suggestionsLoading,

    // actions
    connect,
    sendRequest: connect, // alias for backward compatibility
    acceptRequest,
    rejectRequest,
    disconnect,
    removeSuggestion,
    refreshAllConnections: fetchConnections,
    refreshSuggestions: fetchSuggestions
  };
};
