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

  const fetchConnections = async () => {
    if (!user) return;

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

  const sendRequest = async (addresseeId) => {
    if (!user) return;

    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: 'pending'
    });

    if (error) {
      toast.error('Failed to send request');
    } else {
      toast.success('Connection request sent');
    }
  };

  const acceptRequest = async (connectionId) => {
    await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId);
  };

  const rejectRequest = async (connectionId) => {
    await supabase
      .from('connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId);
  };

  // 🔥 REALTIME
  useEffect(() => {
    if (!user) return;

    fetchConnections();

    const channel = supabase
      .channel('connections-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'connections' },
        fetchConnections
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  return {
    loading,
    connections,
    receivedRequests,
    sentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    refresh: fetchConnections
  };
};