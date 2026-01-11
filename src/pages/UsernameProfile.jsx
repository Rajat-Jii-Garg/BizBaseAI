import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import ProfilePage from './ProfilePage';
import { BusinessDashboard } from './Businesses';

const UsernameProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState(null);
  const [entityId, setEntityId] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEntity = async () => {
      if (!username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // First check profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', username)
          .single();

        if (profile) {
          setEntityType('user');
          setEntityId(profile.id);
          setLoading(false);
          return;
        }

        // Then check businesses
        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .ilike('username', username)
          .eq('status', 'active')
          .single();

        if (business) {
          setEntityType('business');
          setEntityId(business.id);
          setLoading(false);
          return;
        }

        // Not found
        setNotFound(true);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching entity:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchEntity();
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

  if (entityType === 'user') {
    // Redirect to profile page with userId
    navigate(`/profile/${entityId}`, { replace: true });
    return null;
  }

  if (entityType === 'business') {
    // Redirect to business public page
    navigate(`/business/${entityId}/dashboard`, { replace: true });
    return null;
  }

  return null;
};

export default UsernameProfile;
