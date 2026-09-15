import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PROFILE_FIELDS = `
  id,
  username,
  full_name,
  avatar_url,
  banner_url,
  about,
  bio,
  current_position,
  company_name,
  industry,
  location,
  skills
`;

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
      const { data: connectionsData, error: connectionsError } =
        await supabase
          .from('connections')
          .select('*')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

      if (connectionsError) throw connectionsError;

      if (!connectionsData || connectionsData.length === 0) {
        setConnections([]);
        setReceivedRequests([]);
        setSentRequests([]);
        setLoading(false);
        return;
      }

      const userIds = new Set();

      connectionsData.forEach((conn) => {
        if (conn.requester_id !== user.id) {
          userIds.add(conn.requester_id);
        }

        if (conn.addressee_id !== user.id) {
          userIds.add(conn.addressee_id);
        }
      });

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(PROFILE_FIELDS)
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      const profilesMap = Object.fromEntries(
        (profilesData || []).map((profile) => [profile.id, profile])
      );

      const enrichedConnections = connectionsData.map((conn) => ({
        ...conn,
        requester_profile: profilesMap[conn.requester_id] || null,
        addressee_profile: profilesMap[conn.addressee_id] || null,
      }));

      const accepted = [];
      const received = [];
      const sent = [];

      enrichedConnections.forEach((conn) => {
        if (conn.status === 'accepted') {
          accepted.push(conn);
        }

        if (conn.status === 'pending') {
          if (conn.addressee_id === user.id) {
            received.push(conn);
          }

          if (conn.requester_id === user.id) {
            sent.push(conn);
          }
        }
      });

      setConnections(accepted);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!user) return;

    setSuggestionsLoading(true);

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('industry')
        .eq('id', user.id)
        .maybeSingle();

      const {
        data: existingConnections,
        error: existingConnectionsError,
      } = await supabase
        .from('connections')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (existingConnectionsError) {
        throw existingConnectionsError;
      }

      const excludedUserIds = new Set([user.id]);

      (existingConnections || []).forEach((conn) => {
        excludedUserIds.add(conn.requester_id);
        excludedUserIds.add(conn.addressee_id);
      });

      let query = supabase
        .from('profiles')
        .select(PROFILE_FIELDS)
        .not('id', 'eq', user.id);

      if (excludedUserIds.size > 1) {
        const ids = Array.from(excludedUserIds).join(',');

        query = query.not(
          'id',
          'in',
          `(${ids})`
        );
      }

      const { data: allProfiles, error } = await query
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) throw error;

      const sameIndustry = (allProfiles || []).filter(
        (profile) =>
          userProfile?.industry &&
          profile.industry === userProfile.industry
      );

      const otherProfiles = (allProfiles || []).filter(
        (profile) =>
          !userProfile?.industry ||
          profile.industry !== userProfile.industry
      );

      setSuggestions(
        [...sameIndustry, ...otherProfiles].slice(0, 12)
      );
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const removeSuggestion = (profileId) => {
    setSuggestions((previous) =>
      previous.filter((profile) => profile.id !== profileId)
    );

    toast.success('Suggestion removed');
  };

  const connect = async (addresseeId) => {
    if (!user || !addresseeId || addresseeId === user.id) {
      return;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Connection request already exists');
        } else {
          throw error;
        }
      } else {
        toast.success('Connection request sent');

        setSuggestions((previous) =>
          previous.filter(
            (profile) => profile.id !== addresseeId
          )
        );

        await fetchConnections();
      }
    } catch (error) {
      console.error(
        'Error sending connection request:',
        error
      );

      toast.error('Failed to send connection request');

      throw error;
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
    } catch (error) {
      console.error(
        'Error accepting request:',
        error
      );

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

      toast.success('Connection request declined');

      await fetchConnections();
    } catch (error) {
      console.error(
        'Error rejecting request:',
        error
      );

      toast.error('Failed to decline request');
    }
  };

  const disconnect = async (connectionId) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this connection?'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast.success(
        'Connection removed successfully'
      );

      await fetchConnections();
      await fetchSuggestions();
    } catch (error) {
      console.error(
        'Error removing connection:',
        error
      );

      toast.error(
        'Failed to remove connection'
      );
    }
  };

  const withdrawRequest = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast.success(
        'Connection request withdrawn'
      );

      await fetchConnections();
    } catch (error) {
      console.error(
        'Error withdrawing request:',
        error
      );

      toast.error(
        'Failed to withdraw request'
      );
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const initialize = async () => {
      setLoading(true);

      await fetchConnections();

      if (!cancelled) {
        await fetchSuggestions();
      }
    };

    initialize();

    const channel = supabase
      .channel(`connections_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        (payload) => {
          const newRecord = payload.new;
          const oldRecord = payload.old;

          const affectsCurrentUser =
            newRecord?.requester_id === user.id ||
            newRecord?.addressee_id === user.id ||
            oldRecord?.requester_id === user.id ||
            oldRecord?.addressee_id === user.id;

          if (affectsCurrentUser) {
            fetchConnections();
            fetchSuggestions();
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    loading,
    connections,
    receivedRequests,
    sentRequests,
    suggestions,
    suggestionsLoading,

    connect,
    sendRequest: connect,
    acceptRequest,
    rejectRequest,
    disconnect,
    withdrawRequest,
    removeSuggestion,
    refreshAllConnections: fetchConnections,
    refreshSuggestions: fetchSuggestions,
  };
};