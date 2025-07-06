
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  addressee_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester_profile:profiles!connections_requester_id_fkey(full_name, avatar_url),
          addressee_profile:profiles!connections_addressee_id_fkey(full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      const accepted = data?.filter(conn => conn.status === 'accepted') || [];
      const pending = data?.filter(conn => 
        conn.status === 'pending' && conn.addressee_id === user.id
      ) || [];

      setConnections(accepted);
      setPendingRequests(pending);
    } catch (error: any) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (addresseeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert([
          {
            requester_id: user.id,
            addressee_id: addresseeId,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent!"
      });

      fetchConnections();
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    }
  };

  const respondToRequest = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Connection request ${status}!`
      });

      fetchConnections();
    } catch (error: any) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  return {
    connections,
    pendingRequests,
    loading,
    sendConnectionRequest,
    respondToRequest,
    refreshConnections: fetchConnections
  };
};
