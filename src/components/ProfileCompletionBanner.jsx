import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { User, Award, X, CheckCircle, AlertCircle } from 'lucide-react';

const ProfileCompletionBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [completionScore, setCompletionScore] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfileCompletion();
    }
  }, [user]);

  const fetchProfileCompletion = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Agar profile exist nahi karti to insert karo
        if (error.message?.includes('No rows')) {
          await createInitialProfile();
        } else {
          console.error('Error fetching profile:', error.message);
        }
        return;
      }

      // if (error && error.code !== 'PGRST116') {
      //   console.error('Error fetching profile:', error);
      //   return;
      // }

      if (profileData) {
        setProfile(profileData);
        const score = calculateCompletionScore(profileData);
        setCompletionScore(score);
        
        // Hide banner if profile is mostly complete
        if (score >= 80) {
          setShowBanner(false);
        }
      } else {
        // No profile exists, create one
        await createInitialProfile();
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          profile_completion_score: 20
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      setCompletionScore(20);
    } catch (error) {
      console.error('Error creating initial profile:', error);
    }
  };

  const calculateCompletionScore = (profileData) => {
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
      if (profileData[field] && profileData[field].length > 0) {
        score += weight;
      }
    });

    return Math.min(score, 100);
  };

  const getCompletionMessage = () => {
    if (completionScore < 30) {
      return {
        title: "Complete Your Profile",
        message: "Get started by adding your basic information",
        icon: AlertCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10"
      };
    } else if (completionScore < 60) {
      return {
        title: "Boost Your Profile",
        message: "Add more details to improve your professional presence",
        icon: User,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-950/20"
      };
    } else if (completionScore < 80) {
      return {
        title: "Almost There!",
        message: "Just a few more details to complete your profile",
        icon: Award,
        color: "text-primary",
        bgColor: "bg-primary/10"
      };
    } else {
      return {
        title: "Profile Complete!",
        message: "Your profile looks great. Keep it updated",
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950/20"
      };
    }
  };

  if (loading) {
    return (
      <Card className="mb-4 md:mb-6 border shadow-lg bg-muted/30">
        <CardContent className="p-4 md:p-6 text-muted-foreground">Loading profile...</CardContent>
      </Card>
    );
  }

  if (!showBanner || completionScore >= 80) {
    return null;
  }

  const { title, message, icon: Icon, color, bgColor } = getCompletionMessage();

  return (
    <Card className={`mb-4 md:mb-6 border shadow-lg ${bgColor}`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center space-x-3 md:space-x-4 flex-1">
            <div className={`p-2 md:p-3 rounded-full ${bgColor} flex-shrink-0`}>
              <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground mb-1 text-sm md:text-base">{title}</h3>
              <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3">{message}</p>
              <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                <Progress value={completionScore} className="flex-1 h-2" />
                <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">
                  {completionScore}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Button
              onClick={() => navigate('/profile-dashboard')}
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
  );
};

export default ProfileCompletionBanner;