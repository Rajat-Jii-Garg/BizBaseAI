import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileViews } from '@/hooks/useProfileViews';
import { Loader2 } from 'lucide-react';
import ProfilePage from './ProfilePage';
import ProfileDashboard from './ProfileDashboard';
import { BusinessDashboard } from './Businesses';

const UsernameProfile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState(null);
  const [entityId, setEntityId] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (!data || error) {
        setNotFound(true);
      } else {
        setProfileId(data.id);
      }
        setLoading(false);
      };

      fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-muted-foreground mb-6">
          The username "@{username}" doesn't exist.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const isOwnProfile = user?.id === profileId;

  return isOwnProfile
    ? <ProfileDashboard />
    : <ProfilePage userId={profileId} />;
};

export default UsernameProfile;