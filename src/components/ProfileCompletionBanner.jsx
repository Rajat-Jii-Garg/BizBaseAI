import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ProfileEditModal from '@/components/ProfileEditModal';
import { User, Award, X, CheckCircle, AlertCircle } from 'lucide-react';

const ProfileCompletionBanner = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [completionScore, setCompletionScore] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const calculateCompletionScore = useCallback((profileData) => {
    if (!profileData) return 0;

    let score = 0;

    const fields = [
      { field: 'full_name', weight: 10 },
      { field: 'email', weight: 5 },
      { field: 'avatar_url', weight: 10 },
      { field: 'bio', weight: 15 },
      { field: 'current_position', weight: 15 },
      { field: 'company_name', weight: 15 },
      { field: 'location', weight: 10 },
      { field: 'phone', weight: 5 },
      { field: 'linkedin_url', weight: 10 },
      { field: 'website', weight: 10 }
    ];

    fields.forEach(({ field, weight }) => {
      const value = profileData[field];

      if (
        value !== null &&
        value !== undefined &&
        String(value).trim().length > 0
      ) {
        score += weight;
      }
    });

    return Math.min(score, 100);
  }, []);

  const fetchProfileCompletion = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (!profileData) {
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            profile_completion_score: 20
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating initial profile:', createError);
          return;
        }

        setProfile(createdProfile);
        setCompletionScore(calculateCompletionScore(createdProfile));
        return;
      }

      const score = calculateCompletionScore(profileData);

      setProfile(profileData);
      setCompletionScore(score);

      // Keep DB score in sync
      if (profileData.profile_completion_score !== score) {
        await supabase
          .from('profiles')
          .update({
            profile_completion_score: score
          })
          .eq('id', user.id);
      }

      if (score >= 80) {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    } finally {
      setLoading(false);
    }
  }, [user, calculateCompletionScore]);

  useEffect(() => {
    fetchProfileCompletion();
  }, [fetchProfileCompletion]);

  const handleCompleteProfile = () => {
    setShowEditProfile(true);
  };

  const handleProfileUpdate = async () => {
    await fetchProfileCompletion();
  };

  const getCompletionMessage = () => {
    if (completionScore < 30) {
      return {
        title: 'Complete Your Profile',
        message: 'Get started by adding your basic information',
        icon: AlertCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10'
      };
    }

    if (completionScore < 60) {
      return {
        title: 'Boost Your Profile',
        message: 'Add more details to improve your professional presence',
        icon: User,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/20'
      };
    }

    if (completionScore < 80) {
      return {
        title: 'Almost There!',
        message: 'Just a few more details to complete your profile',
        icon: Award,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      };
    }

    return {
      title: 'Profile Complete!',
      message: 'Your profile looks great. Keep it updated',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    };
  };

  if (loading) {
    return (
      <Card className="mb-4 md:mb-6 border shadow-lg bg-muted/30">
        <CardContent className="p-4 md:p-6 text-muted-foreground">
          Loading profile...
        </CardContent>
      </Card>
    );
  }

  if (!showBanner || completionScore >= 80) {
    return null;
  }

  const {
    title,
    message,
    icon: Icon,
    color,
    bgColor
  } = getCompletionMessage();

  return (
    <>
      <Card className={`mb-4 md:mb-6 border shadow-lg ${bgColor}`}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

            <div className="flex items-start md:items-center space-x-3 md:space-x-4 flex-1">
              <div className={`p-2 md:p-3 rounded-full ${bgColor} flex-shrink-0`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground mb-1 text-sm md:text-base">
                  {title}
                </h3>

                <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3">
                  {message}
                </p>

                <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                  <Progress
                    value={completionScore}
                    className="flex-1 h-2"
                  />

                  <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">
                    {completionScore}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">

              <Button
                onClick={handleCompleteProfile}
                className="bg-primary hover:bg-primary/90 flex-1 md:flex-none text-sm"
                size="sm"
              >
                Complete Profile
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controlled Edit Profile Modal */}
      <ProfileEditModal
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
};

export default ProfileCompletionBanner;
