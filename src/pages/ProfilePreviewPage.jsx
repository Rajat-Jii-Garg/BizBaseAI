import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Just import your Profile UI component (the full profile UI)
// We will create this next
import PublicProfileView from '@/components/PublicProfileView';

export default function ProfilePreviewPage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error) setProfile(data);

    setLoading(false);
  }

  if (loading) return <p>Loading preview...</p>;

  return <PublicProfileView profile={profile} />;
}
