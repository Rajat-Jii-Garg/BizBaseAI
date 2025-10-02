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
        color: "text-red-600",
        bgColor: "bg-red-50"
      };
    } else if (completionScore < 60) {
      return {
        title: "Boost Your Profile",
        message: "Add more details to improve your professional presence",
        icon: User,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      };
    } else if (completionScore < 80) {
      return {
        title: "Almost There!",
        message: "Just a few more details to complete your profile",
        icon: Award,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    } else {
      return {
        title: "Profile Complete!",
        message: "Your profile looks great. Keep it updated",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50"
      };
    }
  };

  if (loading) {
    return (
      <Card className="mb-6 border-0 shadow-lg bg-gray-50">
        <CardContent className="p-6 text-gray-500">Loading profile...</CardContent>
      </Card>
    );
  }

  if (!showBanner || completionScore >= 80) {
    return null;
  }

  const { title, message, icon: Icon, color, bgColor } = getCompletionMessage();

  return (
    <Card className={`mb-6 border-0 shadow-lg ${bgColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${bgColor}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-600 text-sm mb-3">{message}</p>
              <div className="flex items-center space-x-3 mb-2">
                <Progress value={completionScore} className="flex-1 h-2" />
                <span className="text-sm font-medium text-gray-700">
                  {completionScore}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => navigate('/user-profile')}
              className="bg-primary hover:bg-primary/90"
            >
              Complete Profile
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBanner(false)}
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