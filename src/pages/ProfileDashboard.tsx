
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  MapPin, 
  Calendar,
  Users,
  Briefcase,
  Plus,
  Settings,
  Bell,
  MessageSquare,
  TrendingUp,
  Star,
  BookOpen,
  Award,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ProfileDashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterBusiness = () => {
    navigate('/dashboard/business-setup');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BizBase
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleRegisterBusiness}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Register Your Business
              </Button>
              
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <MessageSquare className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" onClick={handleSignOut} className="text-sm">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {profile?.full_name || 'Professional User'}
                  </h2>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Professional at BizBase
                  </p>

                  {profile?.email_verified && (
                    <Badge variant="secondary" className="mb-4">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location not set
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {new Date(profile?.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    0 connections
                  </div>
                </div>

                <Separator className="my-4" />

                <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleRegisterBusiness}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Start Your Business
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learning Center
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Award className="w-4 h-4 mr-2" />
                  Get Certified
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to BizBase, {profile?.full_name?.split(' ')[0] || 'Professional'}! 🚀
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Your all-in-one platform for professional growth and business success.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleRegisterBusiness}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Register Your Business
                    </Button>
                    
                    <Button variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Connect with Others
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your activity feed will appear here once you start connecting and engaging.</p>
                  <Button variant="ghost" className="mt-4">
                    Explore Community
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Business Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Business Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={() => navigate('/dashboard/crm')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  CRM System
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={() => navigate('/dashboard/projects')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Project Management
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={() => navigate('/dashboard/finance')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Finance Tracker
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={() => navigate('/dashboard/ai-assistant')}
                >
                  <Star className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Platform Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Businesses</span>
                  <span className="font-semibold">2,500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Professionals</span>
                  <span className="font-semibold">15,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Stories</span>
                  <span className="font-semibold">1,200+</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
