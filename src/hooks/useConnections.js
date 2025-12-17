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

  const refreshAllConnections = async () => {
    await fetchConnections();
  };

  const fetchConnections = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester_profile:profiles!connections_requester_id_fkey(id, full_name, avatar_url, current_position, location),
          addressee_profile:profiles!connections_addressee_id_fkey(id, full_name, avatar_url, current_position, location)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      const accepted = [];
      const received = [];
      const sent = [];

      data.forEach(conn => {
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
      console.error(err);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!user) {
      setLoading(false);
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

  const sendRequest = async (addresseeId) => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: 'pending'
    });

    if (error) {
      toast.error('Failed to send request');
    } else {
      toast.success('Connection request sent');
      fetchConnections(); // ✅ ADD THIS
    }
  };

  const acceptRequest = async (connectionId) => {
    await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId);
    fetchConnections();
  };

  const rejectRequest = async (connectionId) => {
    await supabase
      .from('connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId);
    fetchConnections();
  };

  const handleDisconnect = async (connectionId) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast.success("Connection removed successfully");
      
      fetchConnections();
      fetchSuggestions(); // Refresh suggestions
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error("Failed to remove connection");
    }
  };

  // 🔥 REALTIME
  useEffect(() => {
    if (!user) {
      return;
    }

    setLoading(true);
    fetchConnections().then(fetchSuggestions);

    const channel = supabase
      .channel('connections-${user.id}')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'connections' },
        (payload) => {
          if (
            payload.new?.requester_id === user.id ||
            payload.new?.addressee_id === user.id
          ) {
            fetchConnections();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
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
    sendRequest,
    acceptRequest,
    rejectRequest,
    disconnect: handleDisconnect,


    removeSuggestion,
    refreshAllConnections: fetchConnections,
    refreshSuggestions: fetchSuggestions
  };
};