import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Edit,
  Star,
  Award,
  Calendar,
  Link as LinkIcon,
  Camera,
  Crown,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  ExternalLink,
  FileText,
  Coins,
  GraduationCap,
  MessageCircle,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileEditor from '@/components/ProfileEditor';
import SkillEndorsements from '@/components/SkillEndorsements';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    business_type: '',
    avatar_url: '',
    banner_url: '',
    bio: '',
    location: '',
    website: '',
    linkedin_url: '',
    twitter_url: '',
    github_url: '',
    current_position: '',
    industry: '',
    education: '',
    experience_years: 0,
    skills: [] as string[],
    achievements: [] as string[],
    resume_url: '',
    portfolio_url: '',
    actively_looking_for_work: false,
    profile_completion_score: 0,
    personal_branding_score: 0,
    bizcoins: 0
  });

  useEffect(() => {
    const profileId = userId || user?.id;
    if (profileId) {
      setIsOwnProfile(!userId || userId === user?.id);
      fetchProfile(profileId);
      fetchUserPosts(profileId);
    }
  }, [userId, user]);

  const fetchProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;

      if (data) {
        const safeJsonToStringArray = (jsonData: any): string[] => {
          if (!jsonData) return [];
          if (Array.isArray(jsonData)) {
            return jsonData.filter(item => typeof item === 'string');
          }
          return [];
        };

        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          business_type: data.business_type || '',
          avatar_url: data.avatar_url || '',
          banner_url: data.banner_url || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          linkedin_url: data.linkedin_url || '',
          twitter_url: data.twitter_url || '',
          github_url: data.github_url || '',
          current_position: data.current_position || '',
          industry: data.industry || '',
          education: data.education || '',
          experience_years: data.experience_years || 0,
          skills: safeJsonToStringArray(data.skills),
          achievements: safeJsonToStringArray(data.achievements),
          resume_url: data.resume_url || '',
          portfolio_url: data.portfolio_url || '',
          actively_looking_for_work: data.actively_looking_for_work || false,
          profile_completion_score: data.profile_completion_score || 0,
          personal_branding_score: data.personal_branding_score || 0,
          bizcoins: data.bizcoins || 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const fetchUserPosts = async (profileId: string) => {
    try {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            avatar_url,
            current_position
          )
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleUpdateProfile = async () => {
    await fetchProfile(user?.id || '');
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated and is now live!"
    });
  };

  if (isEditing && isOwnProfile) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <ProfileEditor
            profile={profile}
            onUpdate={handleUpdateProfile}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Enhanced Profile Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl overflow-hidden">
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
              {profile.banner_url && (
                <img 
                  src={profile.banner_url} 
                  alt="Profile Banner" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {isOwnProfile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setIsEditing(true)}
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <CardContent className="p-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-2xl font-bold">
                    {profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {profile.full_name || 'Professional User'}
                  </h2>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Elite
                  </Badge>
                  {profile.actively_looking_for_work && (
                    <Badge className="bg-green-100 text-green-700 animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      Open to Work
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-lg text-gray-600">
                    {profile.current_position && `${profile.current_position}`}
                    {profile.company_name && ` at ${profile.company_name}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {profile.industry && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {profile.industry}
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      {profile.bizcoins} BizCoins
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {isOwnProfile ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                  
                  {profile.resume_url && (
                    <Button variant="outline" asChild>
                      <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                      </a>
                    </Button>
                  )}
                  
                  {profile.portfolio_url && (
                    <Button variant="outline" asChild>
                      <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  About {isOwnProfile ? 'Me' : profile.full_name?.split(' ')[0]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.bio ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>
                      {isOwnProfile 
                        ? "Add a bio to tell others about yourself and your professional journey."
                        : "This user hasn't added a bio yet."
                      }
                    </p>
                    {isOwnProfile && (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                        className="mt-3"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Add Bio
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education Section */}
            {profile.education && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{profile.education}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills & Endorsements Section */}
            <SkillEndorsements 
              profileId={userId || user?.id || ''}
              skills={profile.skills}
              isOwnProfile={isOwnProfile}
            />

            {/* Social Links */}
            {(profile.website || profile.linkedin_url || profile.twitter_url || profile.github_url) && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-purple-600" />
                    Links & Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 hover:text-blue-800">Personal Website</span>
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 hover:text-blue-800">LinkedIn Profile</span>
                    </a>
                  )}
                  {profile.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 hover:text-blue-800">Twitter Profile</span>
                    </a>
                  )}
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 hover:text-blue-800">GitHub Profile</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Progress */}
          <div className="space-y-6">
            {/* Profile Score */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Profile Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {profile.profile_completion_score}/100
                  </div>
                  <p className="text-sm text-gray-600">
                    {isOwnProfile ? 'Complete your profile to reach 100!' : 'Profile completion level'}
                  </p>
                </div>
                <Progress 
                  value={profile.profile_completion_score} 
                  className="h-3 mb-4"
                />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Info</span>
                    <span className="font-semibold">
                      {profile.full_name && profile.phone && profile.location ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Details</span>
                    <span className="font-semibold">
                      {profile.current_position && profile.company_name ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skills & Bio</span>
                    <span className="font-semibold">
                      {profile.skills.length > 0 && profile.bio ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Branding Score */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Branding Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-orange-600 mb-2">
                    {profile.personal_branding_score}/100
                  </div>
                  <p className="text-sm text-gray-600">
                    {isOwnProfile ? 'Build your personal brand' : 'Personal branding strength'}
                  </p>
                </div>
                <Progress 
                  value={profile.personal_branding_score} 
                  className="h-3"
                />
              </CardContent>
            </Card>

            {/* BizCoins */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  BizCoins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {profile.bizcoins}
                  </div>
                  <p className="text-sm text-gray-600">
                    {isOwnProfile ? 'Earn coins by engaging with the community' : 'Community engagement level'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Posts</span>
                  <span className="font-bold text-blue-600">{userPosts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Skills Listed</span>
                  <span className="font-bold text-green-600">{profile.skills.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="font-bold text-purple-600">{profile.experience_years} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Strength</span>
                  <span className={`font-bold ${profile.profile_completion_score >= 80 ? 'text-green-600' : profile.profile_completion_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {profile.profile_completion_score >= 80 ? 'Strong' : profile.profile_completion_score >= 50 ? 'Good' : 'Needs Work'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* User Posts Section */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {isOwnProfile ? 'My Posts' : `${profile.full_name?.split(' ')[0]}'s Posts`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPosts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading posts...</p>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="mb-3">
                      <p className="text-gray-800 leading-relaxed">{post.content}</p>
                    </div>
                    {post.image_url && (
                      <div className="mb-3">
                        <img 
                          src={post.image_url} 
                          alt="Post image" 
                          className="rounded-lg max-h-64 w-auto"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>{post.likes_count || 0} likes</span>
                        <span>{post.comments_count || 0} comments</span>
                        <span>{post.shares_count || 0} shares</span>
                      </div>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>
                  {isOwnProfile 
                    ? "You haven't posted anything yet. Share your first post!"
                    : "This user hasn't posted anything yet."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
