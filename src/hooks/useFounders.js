import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const FOUNDER_STAGES = [
  { value: 'idea', label: 'Idea stage' },
  { value: 'building', label: 'Building MVP' },
  { value: 'launched', label: 'Launched' },
  { value: 'revenue', label: 'Making revenue' },
  { value: 'funded', label: 'Funded' },
];

export const ASK_KINDS = [
  { value: 'cofounder', label: 'Co-founder' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'intro', label: 'Warm intro' },
  { value: 'feedback', label: 'Product feedback' },
  { value: 'customers', label: 'First customers' },
  { value: 'funding', label: 'Fundraising' },
  { value: 'advice', label: 'Advice' },
  { value: 'offer', label: 'Offering help' },
];

export const LOOKING_FOR_OPTIONS = [
  'Co-founder',
  'Technical help',
  'Design help',
  'Marketing help',
  'First customers',
  'Investors',
  'Mentors',
  'Hiring talent',
  'Partnerships',
];

const PROFILE_FIELDS = 'id, full_name, username, avatar_url, current_position, company_name';

/** Attach author profiles to a list of rows keyed by user_id. */
const withAuthors = async (rows) => {
  if (!rows?.length) return [];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .in('id', ids);
  const map = new Map((profiles || []).map((p) => [p.id, p]));
  return rows.map((r) => ({ ...r, author: map.get(r.user_id) || null }));
};

export const useFounderDirectory = () => {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFounders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('founder_profiles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setFounders(await withAuthors(data || []));
    } catch (err) {
      console.error('Error loading founders:', err);
      setFounders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFounders();
  }, [fetchFounders]);

  return { founders, loading, refresh: fetchFounders };
};

export const useMyFounderProfile = () => {
  const { user } = useAuth();
  const [founderProfile, setFounderProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setFounderProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('founder_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      setFounderProfile(data || null);
    } catch (err) {
      console.error('Error loading founder profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (values) => {
    if (!user) return { error: new Error('Not logged in') };
    const payload = { ...values, user_id: user.id };
    const { data, error } = await supabase
      .from('founder_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    if (!error) setFounderProfile(data);
    return { data, error };
  };

  return { founderProfile, loading, saveProfile, refresh: fetchProfile };
};

export const useFounderAsks = (kind = 'all') => {
  const [asks, setAsks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAsks = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('founder_asks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (kind !== 'all') query = query.eq('kind', kind);
      const { data, error } = await query;
      if (error) throw error;
      setAsks(await withAuthors(data || []));
    } catch (err) {
      console.error('Error loading founder asks:', err);
      setAsks([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    fetchAsks();
  }, [fetchAsks]);

  const createAsk = async (values) => {
    const { data: sessionData } = await supabase.auth.getUser();
    const uid = sessionData?.user?.id;
    if (!uid) return { error: new Error('Not logged in') };
    const { data, error } = await supabase
      .from('founder_asks')
      .insert({ ...values, user_id: uid })
      .select()
      .single();
    if (!error) await fetchAsks();
    return { data, error };
  };

  const closeAsk = async (askId) => {
    const { error } = await supabase
      .from('founder_asks')
      .update({ status: 'closed' })
      .eq('id', askId);
    if (!error) await fetchAsks();
    return { error };
  };

  const deleteAsk = async (askId) => {
    const { error } = await supabase.from('founder_asks').delete().eq('id', askId);
    if (!error) await fetchAsks();
    return { error };
  };

  const respondToAsk = async (askId, message) => {
    const { data: sessionData } = await supabase.auth.getUser();
    const uid = sessionData?.user?.id;
    if (!uid) return { error: new Error('Not logged in') };
    const { error } = await supabase
      .from('founder_ask_responses')
      .insert({ ask_id: askId, user_id: uid, message });
    if (!error) await fetchAsks();
    return { error };
  };

  return { asks, loading, refresh: fetchAsks, createAsk, closeAsk, deleteAsk, respondToAsk };
};
