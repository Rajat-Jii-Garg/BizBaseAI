import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileViews } from '@/hooks/useProfileViews';
import { Loader2 } from 'lucide-react';
import ProfilePage from './ProfilePage';
import ProfileDashboard from './ProfileDashboard';

const UsernameProfile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { recordView } = useProfileViews();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (!data || error) {
        setNotFound(true);
      } else {
        setProfileId(data.id);
        setNotFound(false);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  // Record profile view for other users
  useEffect(() => {
    if (profileId && user?.id && profileId !== user.id) {
      recordView(profileId);
    }
  }, [profileId, user?.id, recordView]);

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

  // If preview mode, always show public view (ProfilePage) even for own profile
  if (isPreview && isOwnProfile) {
    return <ProfilePage userId={profileId} isPreview />;
  }

  return isOwnProfile
    ? <ProfileDashboard />
    : <ProfilePage userId={profileId} />;
};

export default UsernameProfile;
