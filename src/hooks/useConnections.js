import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useConnections = () => {
  const [connections, setConnections] = React.useState([]);
  const [pendingRequests, setPendingRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();

  const fetchConnections = async () => {
    if (!user) return;

    try {
      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      const userIds = new Set();
      connectionsData?.forEach(conn => {
        userIds.add(conn.requester_id);
        userIds.add(conn.addressee_id);
      });

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(userIds));

      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const connectionsWithProfiles = connectionsData?.map(conn => ({
        ...conn,
        status: conn.status,
        requester_profile: profilesMap.get(conn.requester_id) || { full_name: 'Unknown User' },
        addressee_profile: profilesMap.get(conn.addressee_id) || { full_name: 'Unknown User' }
      })) || [];

      const accepted = connectionsWithProfiles.filter(conn => conn.status === 'accepted');
      const pending = connectionsWithProfiles.filter(conn => 
        conn.status === 'pending' && conn.addressee_id === user.id
      );

      setConnections(accepted);
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error("Error", { description: "Failed to load connections" });
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (addresseeId) => {
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

      toast.success("Success", { description: "Connection request sent!" });
      fetchConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error("Error", { description: "Failed to send connection request" });
    }
  };

  const respondToRequest = async (connectionId, status) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success("Success", { description: `Connection request ${status}!` });
      fetchConnections();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error("Error", { description: "Failed to respond to request" });
    }
  };

  React.useEffect(() => {
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
